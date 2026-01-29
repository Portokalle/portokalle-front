import type { Appointment } from '@/domain/entities/Appointment';

export type AppointmentNotification = {
  id: string;
  patientName: string | null;
  doctorName: string | null;
  preferredDate: string;
  notes: string;
};

export interface INotificationService {
  fetchAppointmentDetails(appointments: Appointment[]): Promise<AppointmentNotification[]>;
  dismissNotification(appointmentId: string, userId: string): Promise<void>;
  updateAppointmentStatusAndNotify(appointmentId: string, action: 'accepted' | 'rejected'): Promise<void>;
  subscribePendingAppointments(
    doctorId: string,
    onChange: (notifications: Array<{ id: string; patientName: string; appointmentType: string; preferredDate: string; preferredTime: string }>) => void
  ): () => void;
}
