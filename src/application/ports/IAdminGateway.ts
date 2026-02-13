import type { User } from '@/domain/entities/User';
import type { UserRole } from '@/domain/entities/UserRole';
import type { PaginationCursor } from '@/shared/types/PaginationCursor';

export type AdminUser = User & {
  name?: string;
  surname?: string;
  approvalStatus?: 'pending' | 'approved';
  specialization?: string;
  bio?: string;
  specializations?: string[];
  profilePicture?: string;
};

export type UsersPage = {
  items: AdminUser[];
  total: number;
  nextCursor?: PaginationCursor;
};

export interface IAdminGateway {
  getAllUsers(): Promise<AdminUser[]>;
  getUsersPage(pageSize: number, cursor?: PaginationCursor): Promise<UsersPage>;
  getUserById(userId: string): Promise<AdminUser | null>;
  getDoctorProfile(userId: string): Promise<AdminUser | null>;
  createAdminUser(payload: { name: string; surname: string; email: string; password: string }): Promise<User>;
  resetUserPassword(userId: string): Promise<void>;
  generatePasswordResetLink(userId: string): Promise<string | null>;
  deleteUserAccount(userId: string): Promise<void>;
  updateUserFields(user: Partial<AdminUser> & { id: string }): Promise<void>;
  updateDoctorFields(id: string, fields: { specialization?: string; bio?: string; specializations?: string[] }): Promise<void>;
  getTopDoctorsByAppointments(limit?: number): Promise<Array<{ doctor: User; count: number }>>;
  getTopDoctorsByRequests(limit?: number): Promise<Array<{ doctor: User; count: number }>>;
  getUserAppointmentCount(userId: string): Promise<number>;
  getDoctorAppointmentCount(doctorId: string): Promise<number>;
  getUserRole(userId: string): Promise<UserRole | null>;
  dismissAdminNotifications(appointmentIds: string[]): Promise<void>;
}
