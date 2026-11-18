import { ForbiddenException } from '@nestjs/common';

export const CONTENT_ROLES = ['super_admin', 'admin', 'content_admin'];

/** Throws 403 unless the authenticated user has one of the roles. (Authentication itself is done by the global AuthGuard.) */
export function requireRole(req: any, roles: string[]) {
  if (!req?.user || !roles.includes(req.user.role)) {
    throw new ForbiddenException('You do not have permission to manage content');
  }
}
