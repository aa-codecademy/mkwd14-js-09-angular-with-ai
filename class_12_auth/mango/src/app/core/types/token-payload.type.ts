import type { UserRole } from '../models/user.model';

export type TokenPayload = {
  sub: number;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
};
