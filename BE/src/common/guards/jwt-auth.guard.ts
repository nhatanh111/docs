import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  private logError(err: unknown) {
    // small helper to avoid leaking sensitive details while still logging for debugging
    try {
      const msg = err instanceof Error ? err.message : String(err);
      // use console here to make logs visible during tests; in prod integrate with logger
      // Avoid throwing here

      console.error('[JwtAuthGuard] ', msg);
    } catch (e) {
      // best-effort logging failed - fallback output
      console.error('[JwtAuthGuard] log helper failed', e);
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Không có token');

    try {
      const secret = this.configService.get<string>(
        'JWT_SECRET',
        'PVI_SECRET_KEY_2026',
      );
      const decoded = jwt.verify(token, secret) as Record<string, unknown>;
      const req = request as Request & { user?: unknown };
      req.user = decoded;
      return true;
    } catch (err) {
      this.logError(err);
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }
}
