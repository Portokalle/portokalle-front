import type { IAdminGateway, AdminUser, UsersPage } from '@/application/ports/IAdminGateway';
import type { User } from '@/domain/entities/User';
import type { UserRole } from '@/domain/entities/UserRole';
import type { PaginationCursor } from '@/shared/types/PaginationCursor';
import {
  getAllUsers,
  getUsersPage,
  getUserById,
  getDoctorProfile,
  createAdminUser,
  resetUserPassword,
  deleteUserAccount,
  updateUserFields,
  updateDoctorFields,
  getUserAppointmentCount,
  getDoctorAppointmentCount,
  generatePasswordResetLink,
} from '@/infrastructure/services/users';
import { getTopDoctorsByAppointments, getTopDoctorsByRequests } from '@/infrastructure/services/appointments';

export class FirebaseAdminGateway implements IAdminGateway {
  async getAllUsers(): Promise<AdminUser[]> {
    return getAllUsers();
  }

  async getUsersPage(pageSize: number, cursor?: PaginationCursor): Promise<UsersPage> {
    return getUsersPage(pageSize, cursor);
  }

  async getUserById(userId: string): Promise<AdminUser | null> {
    return getUserById(userId);
  }

  async getDoctorProfile(userId: string): Promise<AdminUser | null> {
    return getDoctorProfile(userId);
  }

  async createAdminUser(payload: { name: string; surname: string; email: string; password: string }): Promise<User> {
    return createAdminUser(payload);
  }

  async resetUserPassword(userId: string): Promise<void> {
    await resetUserPassword(userId);
  }

  async generatePasswordResetLink(userId: string): Promise<string | null> {
    return generatePasswordResetLink(userId);
  }

  async deleteUserAccount(userId: string): Promise<void> {
    await deleteUserAccount(userId);
  }

  async updateUserFields(user: Partial<AdminUser> & { id: string }): Promise<void> {
    await updateUserFields(user as Partial<User> & { id: string });
  }

  async updateDoctorFields(id: string, fields: { specialization?: string; bio?: string; specializations?: string[] }): Promise<void> {
    await updateDoctorFields(id, fields);
  }

  async getTopDoctorsByAppointments(limit = 5): Promise<Array<{ doctor: User; count: number }>> {
    return getTopDoctorsByAppointments(limit);
  }

  async getTopDoctorsByRequests(limit = 5): Promise<Array<{ doctor: User; count: number }>> {
    return getTopDoctorsByRequests(limit);
  }

  async getUserAppointmentCount(userId: string): Promise<number> {
    return getUserAppointmentCount(userId);
  }

  async getDoctorAppointmentCount(doctorId: string): Promise<number> {
    return getDoctorAppointmentCount(doctorId);
  }

  async getUserRole(userId: string): Promise<UserRole | null> {
    const user = await getUserById(userId);
    return user?.role ?? null;
  }
}
