import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, ROLES_KEY } from './auth.constants';
import { verifyAccessToken } from './jwt.util';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    const token = typeof authorization === 'string' && authorization.startsWith('Bearer ')
      ? authorization.slice(7).trim()
      : '';
    const payload = token ? verifyAccessToken(token) : null;
    if (!payload) throw new UnauthorizedException('Authentication required or session expired');

    request.user = { id: payload.sub, username: payload.username, role: payload.role };
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (requiredRoles?.length && !requiredRoles.includes(payload.role)) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }
    return true;
  }
}
