import { create } from "zustand";
import { Appointment } from "@/domain/entities/Appointment";
import { getAppointmentAction } from "@/presentation/utils/appointmentActionButton";
import { APPOINTMENT_DURATION_MINUTES } from '@/domain/constants/appointmentConfig';
import { isDoctor } from "@/domain/rules/userRules";
import type { IAppointmentService } from "@/application/ports/IAppointmentService";

interface AppointmentState {
  appointments: Appointment[];
  isDoctor: boolean | null;
  loading: boolean;
  error: string | null;
  setAppointments: (appointments: Appointment[]) => void;
  setIsDoctor: (isDoctor: boolean | null) => void;
  fetchUserRole: (userId: string, service: IAppointmentService) => Promise<void>;
  fetchAppointments: (userId: string, isDoctor: boolean, fetchAppointmentsUseCase: (userId: string, isDoctor: boolean) => Promise<Appointment[]>) => Promise<void>;
  setAppointmentPaid: (appointmentId: string, service: IAppointmentService) => Promise<void>;
  handlePayNow: (appointmentId: string, amount: number, service: IAppointmentService) => Promise<void>;
  checkIfPastAppointment: (appointmentId: string, service: IAppointmentService) => Promise<boolean>;
  verifyStripePayment: (appointmentId: string, service: IAppointmentService) => Promise<void>;
  verifyAndUpdatePayment: (sessionId: string, userId: string, isDoctor: boolean, fetchAppointmentsUseCase: (userId: string, isDoctor: boolean) => Promise<Appointment[]>, service: IAppointmentService) => Promise<void>;
  isPastAppointment: (date: string, time: string) => boolean;
  isAppointmentPast: (appointment: Appointment) => boolean;
  getAppointmentAction: (appointment: Appointment) => { label: string; disabled: boolean; variant: string };
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  isDoctor: null,
  loading: false,
  error: null,
  setAppointments: (appointments) => set({ appointments }),
  setIsDoctor: (isDoctor) => set({ isDoctor }),
  fetchUserRole: async (userId: string, service: IAppointmentService) => {
    set({ loading: true, error: null });
    try {
      const role = await service.getUserRole(userId);
      set({ isDoctor: isDoctor(role), loading: false });
    } catch {
      set({ error: "Failed to fetch user role", loading: false });
    }
  },
  fetchAppointments: async (userId: string, isDoctor: boolean, fetchAppointmentsUseCase) => {
    set({ loading: true, error: null });
    try {
      const fetchedAppointments: Appointment[] = await fetchAppointmentsUseCase(userId, isDoctor);
      set({ appointments: fetchedAppointments, loading: false });
    } catch {
      set({ error: "Failed to fetch appointments", loading: false });
    }
  },
  setAppointmentPaid: async (appointmentId, service) => service.setAppointmentPaid(appointmentId),
  handlePayNow: async (appointmentId, amount, service) => service.handlePayNow(appointmentId, amount),
  checkIfPastAppointment: async (appointmentId, service) => service.checkIfPastAppointment(appointmentId),
  verifyStripePayment: async (appointmentId, service) => service.verifyStripePayment(appointmentId, (id) => get().setAppointmentPaid(id, service)),
  verifyAndUpdatePayment: async (sessionId, userId, isDoctor, fetchAppointmentsUseCase, service) =>
    service.verifyAndUpdatePayment(
      sessionId,
      userId,
      isDoctor,
      (id) => get().setAppointmentPaid(id, service),
      async (uid, isDoc) => get().fetchAppointments(uid, isDoc, fetchAppointmentsUseCase)
    ),
  isPastAppointment: (date, time) => {
    const appointmentDateTime = new Date(`${date}T${time}`);
    const appointmentEndTime = new Date(appointmentDateTime.getTime() + 30 * 60000);
    return appointmentEndTime < new Date();
  },
  isAppointmentPast: (appointment) => {
    const appointmentDateTime = new Date(`${appointment.preferredDate}T${appointment.preferredTime}`);
    const appointmentEndTime = new Date(appointmentDateTime.getTime() + APPOINTMENT_DURATION_MINUTES * 60000);
    return appointmentEndTime < new Date();
  },
  getAppointmentAction: (appointment) => getAppointmentAction(appointment, get().isAppointmentPast),
}));

export const useInitializeAppointments = (fetchAppointmentsUseCase: (userId: string, isDoctor: boolean) => Promise<Appointment[]>) => {
  const { fetchAppointments, setIsDoctor } = useAppointmentStore();
  return async (userId: string, isDoctor: boolean) => {
    setIsDoctor(isDoctor);
    await fetchAppointments(userId, isDoctor, fetchAppointmentsUseCase);
  };
};
