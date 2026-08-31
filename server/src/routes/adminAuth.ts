import { Router, Request, Response } from 'express';
import { Admin } from '../models';
import {
  authenticateAdmin,
  clearAuthCookies,
  generateAdminToken,
  setAuthCookie,
} from '../middleware/auth';
import { createAuditLog } from '../services/auditService';

const router = Router();

// POST /api/admin/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
    if (!admin) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (!admin.isActive) {
      res.status(403).json({ message: 'Account is deactivated' });
      return;
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = generateAdminToken(admin);
    clearAuthCookies(res);
    setAuthCookie(res, 'admin', token);

    await createAuditLog(
      'ADMIN_LOGIN',
      admin.email,
      'admin',
      { adminId: admin._id },
      req.ip || '',
      req.headers['user-agent'] || ''
    );

    res.json({
      admin: {
        id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/logout
router.post('/logout', (_req: Request, res: Response) => {
  clearAuthCookies(res);
  res.json({ message: 'Logged out successfully' });
});

// GET /api/admin/me
router.get('/me', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const admin = req.user;
    res.json({
      id: admin._id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      lastLogin: admin.lastLogin,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/register (only super_admin can create admins)
router.post('/register', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    if (req.user.role !== 'super_admin') {
      res.status(403).json({ message: 'Only super admins can create admin accounts' });
      return;
    }

    const { email, password, fullName, role } = req.body;

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ message: 'Admin with this email already exists' });
      return;
    }

    const admin = await Admin.create({
      email: email.toLowerCase(),
      password,
      fullName,
      role: role || 'admin',
    });

    res.status(201).json({
      id: admin._id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
