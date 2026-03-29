// strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: number;                    // citizen or officer id
  mobile: string;
  type: 'CITIZEN' | 'OFFICER';
  roles?: string[];               // only for officers
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET') ?? 'dev-jwt-secret';

    super({
      // Extract JWT from Authorization header as Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,    // reject expired tokens
      secretOrKey: jwtSecret,
    });
  }

  // This runs automatically after token signature is verified
  // Whatever you return here gets attached to request.user
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload.sub || !payload.type) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return payload;   // becomes req.user in controllers
  }
}