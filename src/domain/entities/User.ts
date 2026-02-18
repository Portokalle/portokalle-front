import { UserRole } from './UserRole';

export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  password?: string;
}
