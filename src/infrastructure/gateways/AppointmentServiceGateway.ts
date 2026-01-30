import type { IAppointmentService } from '@/application/ports/IAppointmentService';
import type { Appointment } from '@/domain/entities/Appointment';
import type { UserRole } from '@/domain/entities/UserRole';
import type { AppointmentPayload } from '@/domain/entities/AppointmentPayload';
import type { BookAppointmentPayload } from '@/domain/entities/BookAppointmentPayload';
import {
  setAppointmentPaid,
  handlePayNow,
  checkIfPastAppointment,
  verifyStripePayment,
  verifyAndUpdatePayment,
  getUserRole,
  getAppointments,
  bookAppointment,
  markSlotAsPending,
  markSlotAsBooked,
  markSlotAsAvailable,
} from '@/infrastructure/services/appointmentService';

export class AppointmentServiceGateway implements IAppointmentService {
  setAppointmentPaid(appointmentId: string): Promise<void> {
    return setAppointmentPaid(appointmentId);
  }

  handlePayNow(appointmentId: string, amount: number): Promise<void> {
    return handlePayNow(appointmentId, amount);
  }

  checkIfPastAppointment(appointmentId: string): Promise<boolean> {
    return checkIfPastAppointment(appointmentId);
  }

  verifyStripePayment(appointmentId: string, setAppointmentPaidFn: (id: string) => Promise<void>): Promise<void> {
    return verifyStripePayment(appointmentId, setAppointmentPaidFn);
  }

  verifyAndUpdatePayment(
    sessionId: string,
    userId: string,
    isDoctor: boolean,
    setAppointmentPaidFn: (id: string) => Promise<void>,
    fetchAppointmentsFn: (userId: string, isDoctor: boolean) => Promise<void>
  ): Promise<void> {
    return verifyAndUpdatePayment(sessionId, userId, isDoctor, setAppointmentPaidFn, fetchAppointmentsFn);
  }

  getUserRole(userId: string): Promise<UserRole> {
    return getUserRole(userId);
  }

  getAppointments(userId: string, isDoctor: boolean): Promise<Appointment[]> {
    return getAppointments(userId, isDoctor);
  }

  bookAppointment(appointmentData: BookAppointmentPayload): Promise<{ id: string } & AppointmentPayload> {
    return bookAppointment(appointmentData);
  }

  markSlotAsPending(doctorId: string, date: string, time: string): Promise<void> {
    return markSlotAsPending(doctorId, date, time);
  }

  markSlotAsBooked(doctorId: string, date: string, time: string): Promise<void> {
    return markSlotAsBooked(doctorId, date, time);
  }

  markSlotAsAvailable(doctorId: string, date: string, time: string): Promise<void> {
    return markSlotAsAvailable(doctorId, date, time);
  }
}
