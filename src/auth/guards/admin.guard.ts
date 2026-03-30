// auth/guards/admin.guard.ts
import { Injectable, CanActivate, ExecutionContext,
         ForbiddenException } from '@nestjs/common';
import { OfficerGuard } from './officer.guard';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class AdminGuard extends OfficerGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {

    // First run OfficerGuard — must be a valid officer with valid JWT
    await super.canActivate(context);

    // Then check if officer has ADMIN role
    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    if (!user.roles || !user.roles.includes('ADMIN')) {
      throw new ForbiddenException('This route is only accessible to admins');
    }

    return true;
  }
}
