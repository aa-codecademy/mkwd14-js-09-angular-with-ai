import type { User } from '../models/auth.model';

export type RegisterResponse = {
  user: User;
};

export type LoginResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};
