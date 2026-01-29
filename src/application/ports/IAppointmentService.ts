import type { Appointment } from '@/domain/entities/Appointment';
import type { AppointmentPayload } from '@/domain/entities/AppointmentPayload';
import type { BookAppointmentPayload } from '@/domain/entities/BookAppointmentPayload';

export interface IAppointmentService {
  setAppointmentPaid(appointmentId: string): Promise<void>;
  handlePayNow(appointmentId: string, amount: number): Promise<void>;
  checkIfPastAppointment(appointmentId: string): Promise<boolean>;
  verifyStripePayment(appointmentId: string, setAppointmentPaid: (id: string) => Promise<void>): Promise<void>;
  verifyAndUpdatePayment(
    sessionId: string,
    userId: string,
    isDoctor: boolean,
    setAppointmentPaid: (id: string) => Promise<void>,
    fetchAppointments: (userId: string, isDoctor: boolean) => Promise<void>
  ): Promise<void>;
  getUserRole(userId: string): Promise<string>;
  getAppointments(userId: string, isDoctor: boolean): Promise<Appointment[]>;
  bookAppointment(appointmentData: BookAppointmentPayload): Promise<{ id: string } & AppointmentPayload>;
  markSlotAsPending(doctorId: string, date: string, time: string): Promise<void>;
  markSlotAsBooked(doctorId: string, date: string, time: string): Promise<void>;
  markSlotAsAvailable(doctorId: string, date: string, time: string): Promise<void>;
}
