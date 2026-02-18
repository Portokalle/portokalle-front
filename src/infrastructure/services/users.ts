import type { User } from '@/domain/entities/User';
import { UserRole } from '@/domain/entities/UserRole';
import { fetchUsers, fetchUserById, fetchDoctorById, fetchUsersPage, UsersPage } from '@/infrastructure/firebase/users';
import type { PaginationCursor } from '@/shared/types/PaginationCursor';
import { apiCreateAdmin, apiResetPassword, apiDeleteUser, apiUpdateUser } from '@/infrastructure/http/admin';
import { fetchAppointmentCountForUser, fetchAppointmentCountForDoctor } from '@/infrastructure/firebase/appointments';

export async function getAllUsers(): Promise<User[]> {
  return fetchUsers();
}

export async function getUsersPage(pageSize: number, cursor?: PaginationCursor): Promise<UsersPage> {
  return fetchUsersPage(pageSize, cursor);
}

export async function getUserById(firebaseId: string): Promise<User | null> {
  return fetchUserById(firebaseId);
}

export async function getDoctorProfile(firebaseId: string): Promise<(User & { name?: string; surname?: string; specialization?: string; bio?: string }) | null> {
  return fetchDoctorById(firebaseId);
}

export async function getUserAppointmentCount(userId: string): Promise<number> {
  return fetchAppointmentCountForUser(userId);
}

export async function getDoctorAppointmentCount(doctorId: string): Promise<number> {
  return fetchAppointmentCountForDoctor(doctorId);
}

export async function createAdminUser(payload: { name: string; surname: string; email: string; password: string }): Promise<User> {
  const res = await apiCreateAdmin(payload);
  return { id: res.id, email: payload.email, role: UserRole.Admin } as User;
}

export async function resetUserPassword(userId: string): Promise<void> {
  await apiResetPassword(userId);
}

export async function generatePasswordResetLink(userId: string): Promise<string | null> {
  const res = await apiResetPassword(userId);
  return res.resetLink ?? null;
}

export async function deleteUserAccount(userId: string): Promise<void> {
  await apiDeleteUser(userId);
}

export async function updateUserFields(user: Partial<User> & { id: string } & Record<string, unknown>): Promise<void> {
  const userFields = {
    name: typeof user.name === 'string' ? user.name : undefined,
    surname: typeof user.surname === 'string' ? user.surname : undefined,
    email: typeof user.email === 'string' ? user.email : undefined,
    phoneNumber: typeof user.phoneNumber === 'string' ? user.phoneNumber : undefined,
    role: typeof user.role === 'string' ? user.role : undefined,
    approvalStatus: (user as { approvalStatus?: 'pending' | 'approved' }).approvalStatus,
    profilePicture: typeof (user as { profilePicture?: string }).profilePicture === 'string'
      ? (user as { profilePicture?: string }).profilePicture
      : undefined,
  };
  await apiUpdateUser({ id: user.id, userFields });
}

export async function updateDoctorFields(id: string, fields: { specialization?: string; bio?: string; specializations?: string[] }): Promise<void> {
  await apiUpdateUser({ id, doctorFields: fields });
}
