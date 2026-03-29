// guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Base JWT guard — just checks if token is valid
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}