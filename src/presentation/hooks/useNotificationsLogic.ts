import { useCallback, useEffect, useState } from 'react';
import { useAppointmentStore } from '@/presentation/store/appointmentStore';
import type { NavigationCoordinator } from '@/presentation/navigation/NavigationCoordinator';
import { useAuth } from '@/presentation/context/AuthContext';
import { useDI } from '@/presentation/context/DIContext';
import { trackEvent } from '@/presentation/analytics/gtag';

export function useNotificationsLogic(nav: NavigationCoordinator) {
  const { appointments, loading: isLoading, error, fetchAppointments } = useAppointmentStore();
  const { user, role, isAuthenticated } = useAuth();
  const { fetchAppointmentsUseCase, notificationService } = useDI();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<
    { id: string; patientName: string | null; doctorName: string | null; preferredDate: string; notes: string }[]
  >([]);
  const [pendingAppointments, setPendingAppointments] = useState<
    { id: string; patientName: string | null; doctorName: string | null; preferredDate: string; notes: string; status?: string; dismissedBy?: Record<string, boolean> }[]
  >([]);

  useEffect(() => {
    const fetchUserRoleAndAppointments = async () => {
      if (!isAuthenticated || !user?.uid) {
        nav.toLogin();
        return;
      }
      setUserRole(role ?? null);
      if (!role) return;
      await fetchAppointments(
        user.uid,
        role === 'doctor',
        (userId: string, isDoctor: boolean) => fetchAppointmentsUseCase.execute(userId, isDoctor)
      );
    };
    fetchUserRoleAndAppointments();
  }, [fetchAppointments, isAuthenticated, user, role, fetchAppointmentsUseCase, nav]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (appointments.length > 0) {
        const details = await notificationService.fetchAppointmentDetails(appointments);
        setAppointmentDetails(details);
      }
    };
    fetchDetails();
  }, [appointments, notificationService]);

  useEffect(() => {
    const fetchRelevantAppointments = async () => {
      if (!user?.uid) return;
      if (userRole === 'doctor') {
        const pending = appointmentDetails.filter((appointment) => {
          const found = appointments.find((a) => a.id === appointment.id);
          return found?.status === 'pending' && !(found?.dismissedBy && found.dismissedBy[user.uid]);
        });
        setPendingAppointments(pending);
      } else if (userRole === 'patient') {
        const withStatus = appointmentDetails.map((appointment) => {
          const found = appointments.find((a) => a.id === appointment.id);
          return { ...appointment, status: found?.status || 'pending', doctorName: found?.doctorName || appointment.doctorName, dismissedBy: found?.dismissedBy };
        }).filter((appt) => !(appt.dismissedBy && appt.dismissedBy[user.uid]));
        setPendingAppointments(withStatus);
      }
    };
    if (userRole && appointmentDetails.length > 0) {
      fetchRelevantAppointments();
    }
  }, [userRole, appointmentDetails, appointments, user]);

  const handleDismissNotification = useCallback(async (id: string) => {
    setPendingAppointments((prev) => prev.filter((appt) => appt.id !== id));
    if (!user?.uid) return;
    await notificationService.dismissNotification(id, user.uid);
  }, [notificationService, user]);

  const handleAppointmentAction = useCallback(async (appointmentId: string, action: 'accepted' | 'rejected') => {
    try {
      trackEvent(action === 'accepted' ? 'accept_appointment' : 'decline_appointment', {
        appointment_id: appointmentId,
        source: 'notifications',
      });
      await notificationService.updateAppointmentStatusAndNotify(appointmentId, action);
      setPendingAppointments((prev) =>
        prev.filter((appointment) => appointment.id !== appointmentId)
      );
    } catch {}
  }, [notificationService]);

  return {
    isLoading,
    error,
    userRole,
    pendingAppointments,
    handleDismissNotification,
    handleAppointmentAction,
  };
}
