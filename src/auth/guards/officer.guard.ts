// guards/officer.guard.ts
import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class OfficerGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {

    const isAuthenticated = await (super.canActivate(context) as Promise<boolean>);

    if (!isAuthenticated) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    if (user.type !== 'OFFICER') {
      throw new ForbiddenException('This route is only accessible to officers');
    }

    return true;
  }
}