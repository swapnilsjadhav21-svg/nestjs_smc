// guards/citizen.guard.ts
import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class CitizenGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {

    // Cast is required — super.canActivate returns boolean | Promise<boolean>
    // We must await it properly for Passport to populate request.user
    const isAuthenticated = await (super.canActivate(context) as Promise<boolean>);

    if (!isAuthenticated) {
      return false;
    }

    // Now request.user is safely populated by Passport
    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    if (user.type !== 'CITIZEN') {
      throw new ForbiddenException('This route is only accessible to citizens');
    }

    return true;
  }
}