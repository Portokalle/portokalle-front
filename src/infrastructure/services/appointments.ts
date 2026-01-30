import type { User } from '@/domain/entities/User';
import { UserRole } from '@/domain/entities/UserRole';
import { fetchAppointmentCountForDoctor } from '@/infrastructure/firebase/appointments';
import { fetchUsers } from '@/infrastructure/firebase/users';

export async function getTopDoctorsByAppointments(limit = 5): Promise<Array<{ doctor: User; count: number }>> {
  const users = await fetchUsers();
  const doctors = users.filter(u => u.role === UserRole.Doctor);
  const results: Array<{ doctor: User; count: number }> = [];

  // Limit concurrency to avoid overwhelming Firestore
  const CONCURRENCY = 6;
  for (let i = 0; i < doctors.length; i += CONCURRENCY) {
    const batch = doctors.slice(i, i + CONCURRENCY);
    const counts = await Promise.all(
      batch.map(async (doc) => ({
        doctor: doc,
        count: await fetchAppointmentCountForDoctor(doc.id),
      }))
    );
    results.push(...counts);
  }

  return results.sort((a, b) => b.count - a.count).slice(0, limit);
}

export async function getTopDoctorsByRequests(limit = 5): Promise<Array<{ doctor: User; count: number }>> {
  // For now, treat requests equal to appointments; adjust when a requests collection exists.
  return getTopDoctorsByAppointments(limit);
}
