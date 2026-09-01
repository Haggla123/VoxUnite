import { Request, Response, NextFunction, CookieOptions } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { Admin, EligibleVoter } from '../models';

interface JwtPayload {
  id: string;
  role?: string;
  type: 'admin' | 'student';
  studentId?: string;
  email?: string;
  faculty?: string;
  department?: string;
  fullName?: string;
  exp?: number;
}

const ADMIN_COOKIE_NAME = 'adminToken';
const STUDENT_COOKIE_NAME = 'studentToken';

const getSameSite = (): CookieOptions['sameSite'] => {
  const configured = process.env.COOKIE_SAME_SITE?.toLowerCase();
  if (configured === 'strict' || configured === 'none') return configured;
  return 'lax';
};

const getCookieOptions = (token?: string): CookieOptions => {
  const sameSite = getSameSite();
  const decoded = token ? jwt.decode(token) as JwtPayload | null : null;
  const maxAge = decoded?.exp ? Math.max(decoded.exp * 1000 - Date.now(), 0) : undefined;

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
    sameSite,
    path: '/',
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
};

export const setAuthCookie = (
  res: Response,
  type: 'admin' | 'student',
  token: string
): void => {
  const name = type === 'admin' ? ADMIN_COOKIE_NAME : STUDENT_COOKIE_NAME;
  res.cookie(name, token, getCookieOptions(token));
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie(ADMIN_COOKIE_NAME, getCookieOptions());
  res.clearCookie(STUDENT_COOKIE_NAME, getCookieOptions());
};

const getCookieValue = (cookieHeader: string | undefined, name: string): string | undefined => {
  if (!cookieHeader) return undefined;

  const value = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);

  return value ? decodeURIComponent(value) : undefined;
};

const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
};

declare global {
  namespace Express {
    interface Request {
      user?: any;
      adminId?: string;
      studentVoter?: any;
    }
  }
}

export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.[ADMIN_COOKIE_NAME];

    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const decoded = verifyToken(token);

    if (decoded.type !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      res.status(401).json({ message: 'Invalid admin session' });
      return;
    }

    req.user = admin;
    req.adminId = admin._id.toString();
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authenticateStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.[STUDENT_COOKIE_NAME];

    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const decoded = verifyToken(token);

    if (decoded.type !== 'student') {
      res.status(403).json({ message: 'Student access required' });
      return;
    }

    const voter = await EligibleVoter.findOne({
      studentId: decoded.studentId,
      email: decoded.email,
      isActive: true,
    });

    if (!voter) {
      res.status(401).json({ message: 'Invalid or inactive student session' });
      return;
    }

    req.studentVoter = voter;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const generateAdminToken = (admin: any): string => {
  const expiresIn = (process.env.JWT_EXPIRES_IN || '24h') as SignOptions['expiresIn'];

  return jwt.sign(
    { id: admin._id, role: admin.role, type: 'admin' },
    process.env.JWT_SECRET as string,
    { expiresIn }
  );
};

export const generateStudentToken = (voter: any): string => {
  return jwt.sign(
    {
      id: voter._id,
      studentId: voter.studentId,
      email: voter.email,
      faculty: voter.faculty,
      department: voter.department,
      fullName: voter.fullName,
      type: 'student',
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '4h' }
  );
};

export const authenticateSocket = async (
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> => {
  try {
    const adminToken = getCookieValue(socket.handshake.headers.cookie, ADMIN_COOKIE_NAME);
    const studentToken = getCookieValue(socket.handshake.headers.cookie, STUDENT_COOKIE_NAME);
    const token = adminToken || studentToken;

    if (!token) {
      next(new Error('Authentication required'));
      return;
    }

    const decoded = verifyToken(token);

    if (decoded.type === 'admin') {
      const admin = await Admin.findById(decoded.id);
      if (!admin || !admin.isActive) {
        next(new Error('Invalid admin session'));
        return;
      }
      socket.data.user = { id: admin._id, role: admin.role, type: 'admin' };
      next();
      return;
    }

    if (decoded.type === 'student' && decoded.studentId && decoded.email) {
      const voter = await EligibleVoter.findOne({
        studentId: decoded.studentId,
        email: decoded.email,
        isActive: true,
      });
      if (!voter) {
        next(new Error('Invalid student session'));
        return;
      }
      socket.data.user = decoded;
      next();
      return;
    }

    next(new Error('Invalid session type'));
  } catch (error) {
    next(new Error('Invalid or expired token'));
  }
};
