import { create } from 'zustand';
import { fetchAppointments } from '../domain/appointmentService';
import { Appointment } from '../models/Appointment';
import { formatDate } from '../utils/dateUtils';
import { UserRole } from '../models/UserRole';
import { getNavigationPaths, NavigationItem } from './navigationStore';
import { JSX } from 'react';

interface DashboardState {
  totalAppointments: number;
  nextAppointment: string | null;
  recentAppointments: Appointment[];
  fetchAppointments: (userId: string, role: UserRole) => Promise<void>;
  sidebarOpen: boolean;
  navPaths: (NavigationItem & { icon?: JSX.Element })[];
  toggleSidebar: () => void;
  fetchNavigationPaths: (role: UserRole) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  totalAppointments: 0,
  nextAppointment: null,
  recentAppointments: [],
  fetchAppointments: async (userId, role) => {
    try {
      const isDoctor = role === UserRole.Doctor;
      const appointments = await fetchAppointments(userId, isDoctor);

      // Filter and sort upcoming appointments
      const upcomingAppointments = appointments
        .filter((appointment) => {
          const isUpcoming = appointment.preferredDate && new Date(appointment.preferredDate) > new Date();
          const isAccepted = isDoctor ? appointment.status === 'accepted' : true;
          return isUpcoming && isAccepted;
        })
        .sort((a, b) => new Date(a.preferredDate!).getTime() - new Date(b.preferredDate!).getTime());

      // Sort appointments by preferredDate in descending order for recent appointments
      const sortedAppointments = appointments
        .filter((appointment) => appointment.preferredDate)
        .sort((a, b) => new Date(b.preferredDate!).getTime() - new Date(a.preferredDate!).getTime())
        .slice(0, 5);

      set((state) => ({
        ...state,
        totalAppointments: appointments.length,
        nextAppointment: upcomingAppointments.length
          ? `${formatDate(upcomingAppointments[0].preferredDate!)} at ${upcomingAppointments[0].preferredTime || 'N/A'}`
          : null,
        recentAppointments: sortedAppointments,
      }));
    } catch {
      set((state) => ({ ...state, totalAppointments: 0, nextAppointment: null, recentAppointments: [] }));
    }
  },
  sidebarOpen: false,
  navPaths: [],
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  fetchNavigationPaths: (role) => set({ navPaths: getNavigationPaths(role) }),
}));
