import { UserRole } from '../auth/entities/user.entity';

/**
 * Fixed accounts used by the AUTH_BYPASS escape hatch. They are seeded into the
 * database so that rows referencing a user (orders, for example) still point at
 * a real record while the modules that have not covered auth yet are running.
 */
export interface DevUserSpec {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export const DEV_USER_PASSWORD = 'devpassword123';

export const DEV_USERS: DevUserSpec[] = [
  {
    email: 'dev-admin@mango.local',
    password: DEV_USER_PASSWORD,
    firstName: 'Marta',
    lastName: 'Ilievska',
    role: 'ADMIN',
  },
  {
    email: 'dev-user@mango.local',
    password: DEV_USER_PASSWORD,
    firstName: 'Bojan',
    lastName: 'Trajkovski',
    role: 'USER',
  },
];
