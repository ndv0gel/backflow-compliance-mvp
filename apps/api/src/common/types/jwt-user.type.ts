import { UserRole } from '@prisma/client';

export interface JwtUser {
  sub: string;
  email: string;
  role: UserRole;
}
