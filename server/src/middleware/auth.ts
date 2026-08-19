import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models';

interface JwtPayload {
  id: string;
  role: string;
  type: 'admin' | 'student';
}

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
    const token =
      req.headers.authorization?.replace('Bearer ', '') ||
      req.cookies?.adminToken;

    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

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
    req.adminId = admin._id as string;
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
    const token =
      req.headers.authorization?.replace('Bearer ', '') ||
      req.cookies?.studentToken;

    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    if (decoded.type !== 'student') {
      res.status(403).json({ message: 'Student access required' });
      return;
    }

    req.studentVoter = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const generateAdminToken = (admin: any): string => {
  return jwt.sign(
    { id: admin._id, role: admin.role, type: 'admin' },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
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
