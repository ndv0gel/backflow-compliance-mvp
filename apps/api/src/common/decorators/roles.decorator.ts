import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../constants/roles-key.constant';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
