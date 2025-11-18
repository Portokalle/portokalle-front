import { create } from "zustand";
import { fetchAppointments, setAppointmentPaid, handlePayNow, checkIfPastAppointment, verifyStripePayment, getUserRole } from "../domain/appointmentService";
import { Appointment } from "../models/Appointment";
import { getAppointmentAction } from "./appointmentActionButton";
import { APPOINTMENT_DURATION_MINUTES } from '../config/appointmentConfig';
import { USER_ROLE_DOCTOR } from "@/config/userRoles";

interface AppointmentState {
  appointments: Appointment[];
  isDoctor: boolean | null;
  loading: boolean;
  error: string | null;
  setAppointments: (appointments: Appointment[]) => void;
  setIsDoctor: (isDoctor: boolean | null) => void;
  fetchUserRole: (userId: string) => Promise<void>;
  fetchAppointments: (userId: string, isDoctor: boolean) => Promise<void>;
  setAppointmentPaid: (appointmentId: string) => Promise<void>;
  handlePayNow: (appointmentId: string, amount: number) => Promise<void>;
  checkIfPastAppointment: (appointmentId: string) => Promise<boolean>;
  verifyStripePayment: (appointmentId: string) => Promise<void>;
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
  fetchUserRole: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const role = await getUserRole(userId);
      set({ isDoctor: role === USER_ROLE_DOCTOR, loading: false });
    } catch {
      set({ error: "Failed to fetch user role", loading: false });
    }
  },
  fetchAppointments: async (userId: string, isDoctor: boolean) => {
    set({ loading: true, error: null });
    try {
      const fetchedAppointments: Appointment[] = await fetchAppointments(userId, isDoctor);
      const updatedAppointments = fetchedAppointments.map((appointment) => {
        const appointmentDateTime = new Date(`${appointment.preferredDate}T${appointment.preferredTime}`);
        const appointmentEndTime = new Date(appointmentDateTime.getTime() + APPOINTMENT_DURATION_MINUTES * 60000); // use constant
        const isPast = appointmentEndTime < new Date();
        return { ...appointment, isPast };
      });
      set({ appointments: updatedAppointments, loading: false });
    } catch {
      set({ error: "Failed to fetch appointments", loading: false });
    }
  },
  setAppointmentPaid: async (appointmentId) => setAppointmentPaid(appointmentId),
  handlePayNow: async (appointmentId, amount) => handlePayNow(appointmentId, amount),
  checkIfPastAppointment: async (appointmentId) => checkIfPastAppointment(appointmentId),
  verifyStripePayment: async (appointmentId) => verifyStripePayment(appointmentId, get().setAppointmentPaid),
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

export const useInitializeAppointments = () => {
  const { fetchAppointments, setIsDoctor } = useAppointmentStore();
  return async (userId: string, isDoctor: boolean) => {
    setIsDoctor(isDoctor);
    await fetchAppointments(userId, isDoctor);
  };
};
