import type { UserRole } from './enums';

export interface AuthPayload {
  sub: string; // user id
  role: UserRole;
}
