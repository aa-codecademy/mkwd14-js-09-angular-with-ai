import type { User } from '../models/auth.model';

// Separate response types per endpoint, because they genuinely differ: registering
// returns only the created user...
export type RegisterResponse = {
  user: User;
};

// ...while logging in also hands back the two tokens. Modelling them as one shared type
// with optional tokens would force `res.accessToken!` at every call site.
export type LoginResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};
