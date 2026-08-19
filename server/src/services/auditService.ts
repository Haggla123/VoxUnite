import { AuditLog } from '../models';
import { AuditAction } from '../models/AuditLog';

export const createAuditLog = async (
  action: AuditAction,
  performedBy: string,
  userRole: 'admin' | 'student' | 'system',
  metadata: Record<string, any> = {},
  ipAddress: string = '',
  userAgent: string = ''
) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      userRole,
      metadata,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};
