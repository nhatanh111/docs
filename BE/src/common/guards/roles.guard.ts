import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;

    const reqRaw: unknown = context.switchToHttp().getRequest();
    if (typeof reqRaw !== 'object' || reqRaw === null) return false;
    const req = reqRaw as Request & { user?: { role?: string } };
    const role = req.user?.role;

    if (!role || !requiredRoles.includes(role)) {
      throw new ForbiddenException('Từ chối: Yêu cầu quyền Admin');
    }
    return true;
  }
}
