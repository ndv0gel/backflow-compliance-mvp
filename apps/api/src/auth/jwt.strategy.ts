import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { JwtUser } from '../common/types/jwt-user.type';

const cookieExtractor = (request: Request): string | null => {
  if (request && request.cookies) {
    return request.cookies.access_token as string;
  }

  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'replace-me'),
    });
  }

  validate(payload: { sub: string; email: string; role: UserRole }): JwtUser {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
