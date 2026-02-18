import type { UserRole } from '@/domain/entities/UserRole';
import { apiClient } from '@/infrastructure/http/apiClient';

export async function apiCreateAdmin(payload: { name: string; surname: string; email: string; password: string }) {
  const res = await fetch('/api/admin/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to create admin');
  return data as { id: string; role: UserRole };
}

export async function apiResetPassword(userId: string) {
  const res = await fetch('/api/admin/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to reset password');
  return data as { ok: boolean; resetLink?: string };
}

export async function apiDeleteUser(userId: string) {
  const res = await fetch('/api/admin/delete-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to delete user');
  return data as { ok: boolean };
}

export async function apiDismissAppointments(appointmentIds: string[]) {
  const res = await fetch('/api/admin/dismiss-appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appointmentIds }),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to dismiss appointments');
  return data as { ok: boolean };
}

export async function apiUpdateUser(payload: {
  id: string;
  userFields?: {
    name?: string;
    surname?: string;
    role?: string;
    email?: string;
    phoneNumber?: string;
    approvalStatus?: 'pending' | 'approved';
    profilePicture?: string;
  };
  doctorFields?: { specialization?: string; bio?: string; specializations?: string[] };
}) {
  const res = await apiClient.post<{ ok: boolean; error?: string }>('/api/admin/update-user', payload);
  if (res.status !== 200 || !res.data?.ok) {
    throw new Error(res.data?.error || 'Failed to update user');
  }
  return res.data;
}
