import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY, ROLES_KEY } from './auth.constants';

export const Public = (isPublic = true) => SetMetadata(IS_PUBLIC_KEY, isPublic);
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
