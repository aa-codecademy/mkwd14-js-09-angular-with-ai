// A union of string literals instead of `string`: TypeScript now rejects a typo like
// 'admin' at compile time, and editors autocomplete the two valid values.
export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  // Dates arrive from JSON as ISO strings, never as Date objects - JSON has no date type.
  // Parse with `new Date(user.createdAt)` only where you actually need to format it.
  createdAt: string;
}
