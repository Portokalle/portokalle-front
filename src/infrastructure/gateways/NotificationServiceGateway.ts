import type { INotificationService, AppointmentNotification } from '@/application/ports/INotificationService';
import type { Appointment } from '@/domain/entities/Appointment';
import { db } from '@/infrastructure/firebase/firebaseconfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { fetchAppointmentDetails, dismissNotification } from '@/infrastructure/services/notificationService';
import { updateAppointmentStatusAndNotify } from '@/infrastructure/services/appointmentNotificationService';

export class NotificationServiceGateway implements INotificationService {
  fetchAppointmentDetails(appointments: Appointment[]): Promise<AppointmentNotification[]> {
    return fetchAppointmentDetails(appointments);
  }

  dismissNotification(appointmentId: string, userId: string): Promise<void> {
    return dismissNotification(appointmentId, userId);
  }

  updateAppointmentStatusAndNotify(appointmentId: string, action: 'accepted' | 'rejected'): Promise<void> {
    return updateAppointmentStatusAndNotify(appointmentId, action);
  }

  subscribePendingAppointments(
    doctorId: string,
    onChange: (notifications: Array<{ id: string; patientName: string; appointmentType: string; preferredDate: string; preferredTime: string }>) => void
  ): () => void {
    if (!doctorId) return () => {};
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId),
      where('status', '==', 'pending')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Array<{
        id: string;
        patientName: string;
        appointmentType: string;
        preferredDate: string;
        preferredTime: string;
      }>;
      onChange(items);
    });
    return () => unsubscribe();
  }
}
