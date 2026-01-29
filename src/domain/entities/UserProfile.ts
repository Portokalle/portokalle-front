import { UserRole } from './UserRole';

export interface UserProfile {
  id: string;
  name?: string;
  surname?: string;
  email?: string;
  phoneNumber?: string;
  about?: string;
  specializations?: string[];
  specialization?: string;
  education?: string[];
  bio?: string;
  profilePicture?: string;
  role?: UserRole;
  approvalStatus?: 'pending' | 'approved';
}
