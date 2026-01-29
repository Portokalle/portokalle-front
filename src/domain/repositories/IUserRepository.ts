import { UserRole } from '../entities/UserRole';

export type UserRecord = {
  id: string;
  role: UserRole;
  email?: string;
  name?: string;
  surname?: string;
  specialization?: string[];
  profilePicture?: string;
  approvalStatus?: 'pending' | 'approved';
};

export interface IUserRepository {
  getById(id: string): Promise<UserRecord | null>;
  getByRole(role: UserRole): Promise<Array<UserRecord>>;
  create(payload: { id: string; role: UserRole }): Promise<void>;
  update(id: string, updates: Partial<UserRecord>): Promise<void>;
  authenticate(email: string, password: string): Promise<UserRecord | null>;
  isProfileIncomplete(role: UserRole, userId: string): Promise<boolean>;
  delete(id: string): Promise<void>;
}
