import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './public.decorator';

export const ADMIN_ROLES = ['admin', 'super_admin', 'scorer', 'content_admin'];

export function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  return 'dev-only-insecure-secret-change-me';
}

/** Global guard: every route needs a valid admin Bearer token unless marked @Public(). */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();
    if (req.method === 'OPTIONS') return true;

    const header: string = req.headers['authorization'] || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedException('Authentication required');

    try {
      const payload = await this.jwt.verifyAsync(token);
      if (!ADMIN_ROLES.includes(payload.role)) throw new Error('role');
      req.user = { id: payload.sub, email: payload.email, role: payload.role, name: payload.name };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
