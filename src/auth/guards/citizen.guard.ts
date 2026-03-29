// guards/citizen.guard.ts
import { Injectable, CanActivate, ExecutionContext, 
         ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class CitizenGuard extends JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {

    // First run base JWT validation
    await super.canActivate(context);

    // Then check type is CITIZEN
    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    if (user.type !== 'CITIZEN') {
      throw new ForbiddenException('This route is only accessible to citizens');
    }

    return true;
  }
}