import { useCallback } from 'react';
import { useAppointmentStore } from '@/presentation/store/appointmentStore';
import { useVideoStore } from '@/presentation/store/videoStore';
import { useAuth } from '@/presentation/context/AuthContext';
import { useDI } from '@/presentation/context/DIContext';
import { trackEvent } from '@/presentation/analytics/gtag';
import { UserRole } from '@/domain/entities/UserRole';

export function useDashboardActions() {
  const { user } = useAuth();
  const { setAuthStatus, generateRoomCodeAndStore } = useVideoStore();
  const { handlePayNow: storeHandlePayNow } = useAppointmentStore();
  const { appointmentService, videoService } = useDI();

  // Join call using Zustand store and localStorage hydration
  const handleJoinCall = useCallback(async (appointmentId: string) => {
    try {
      setAuthStatus(!!user, user?.uid || null, user?.name || null);
      if (!user?.uid) {
        alert('You must be logged in to join a call. Please log in and try again.');
        return;
      }
      // For dashboard actions, assume patient role and use user name
      const role = UserRole.Patient;
      const patientName = user.name || 'Guest';
      trackEvent('join_call', { appointment_id: appointmentId, role, source: 'dashboard' });
      const roomCode = await generateRoomCodeAndStore({
        appointmentId,
        userId: user.uid,
        role,
        userName: patientName,
      }, videoService);
      window.localStorage.setItem('videoSessionRoomCode', roomCode);
      window.localStorage.setItem('videoSessionUserName', patientName);
      window.location.href = '/dashboard/appointments/video-session';
    } catch (error) {
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [user, setAuthStatus, generateRoomCodeAndStore, videoService]);

  const handlePayNow = useCallback((appointmentId: string, amount: number) => {
    trackEvent('pay_now', { appointment_id: appointmentId, amount, source: 'dashboard' });
    storeHandlePayNow(appointmentId, amount, appointmentService);
  }, [storeHandlePayNow, appointmentService]);

  return { handleJoinCall, handlePayNow };
}
