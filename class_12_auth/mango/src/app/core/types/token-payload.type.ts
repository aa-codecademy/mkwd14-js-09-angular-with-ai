import type { UserRole } from '../models/user.model';

// The decoded contents of the JWT. These names are not ours to choose - they are the
// registered JWT claims the backend signs, so they must match the server exactly.
export type TokenPayload = {
  sub: number; // "subject" - the user id the token belongs to
  email: string;
  role: UserRole;
  iat: number; // "issued at"  - UNIX timestamp in SECONDS, not milliseconds
  exp: number; // "expires at" - same unit; multiply by 1000 before `new Date(...)`
};
