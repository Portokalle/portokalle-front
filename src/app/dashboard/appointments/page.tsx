"use client";

import { useEffect, useState } from "react";
import RedirectingModal from '@/app/components/RedirectingModal';
import { useAppointmentStore } from '@/store/appointmentStore';
import { getAppointments } from '@/domain/appointmentService';
import { useAuth } from '@/context/AuthContext';
import { useVideoStore } from '@/store/videoStore';
import RoleGuard from '@/app/components/RoleGuard';
import { AppointmentsTable } from '@/app/components/SharedAppointmentsTable';
import { USER_ROLE_DOCTOR, USER_ROLE_PATIENT } from '@/config/userRoles';


function AppointmentsPage() {
  const [showRedirecting, setShowRedirecting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const {
    appointments,
    isDoctor,
    handlePayNow,
    isAppointmentPast,
    fetchAppointments,
    verifyAndUpdatePayment,
  } = useAppointmentStore();
  const { setAuthStatus } = useVideoStore();

  // Sync auth status with store
  useEffect(() => {
    setAuthStatus(isAuthenticated, user?.uid || null, user?.name || null);
  }, [isAuthenticated, user, setAuthStatus]);

  // Set doctor/patient role
  useEffect(() => {
    if (!user?.uid) return;
    // Use domain/application layer to fetch user role
    // Example: import { fetchUserRoleUseCase } from '@/application/fetchUserRoleUseCase';
    // fetchUserRoleUseCase(user.uid).then(role => { /* update store or local state */ });
    // For now, remove direct store call
  }, [user]);

  // Fetch appointments on user/role change
  useEffect(() => {
    if (!user?.uid || typeof isDoctor !== 'boolean') return;
    fetchAppointments(user.uid, isDoctor, getAppointments);
  }, [user, isDoctor, fetchAppointments]);

  // Check payment status on mount
  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    if (!sessionId) return;
    (async () => {
      try {
        if (user?.uid && typeof isDoctor === 'boolean') {
          await verifyAndUpdatePayment(sessionId, user.uid, isDoctor, getAppointments);
        }
      } catch {
        // Optionally handle error
      }
    })();
  }, [verifyAndUpdatePayment, user, isDoctor]);

  // Join call handler
  const handleJoinCall = async (appointmentId: string) => {
    try {
      setShowRedirecting(true);
      setAuthStatus(!!user, user?.uid || null, user?.name || null);
      if (!user?.uid) {
        setShowRedirecting(false);
        alert('You must be logged in to join a call. Please log in and try again.');
        return;
      }
      const appointment = appointments.find(a => a.id === appointmentId);
      const patientName = appointment?.patientName || user.name || 'Guest';
      const { generateRoomCodeAndStore } = useVideoStore.getState();
      const role = isDoctor ? 'doctor' : 'patient';
      const roomCode = await generateRoomCodeAndStore({
        appointmentId,
        userId: user.uid,
        role,
        userName: patientName,
      });
      window.localStorage.setItem('videoSessionRoomCode', roomCode);
      window.localStorage.setItem('videoSessionUserName', patientName);
      window.location.href = '/dashboard/appointments/video-session';
    } catch {
      setShowRedirecting(false);
      alert('An error occurred. Please try again.');
    }
  };

  // Loader is now handled by RoleGuard, so no need to show it here

  return (
    <div>
      <RedirectingModal show={showRedirecting} />
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-lg md:text-2xl">Your Appointments</h2>
          <AppointmentsTable
            appointments={appointments}
            role={isDoctor ? USER_ROLE_DOCTOR : USER_ROLE_PATIENT}
            isAppointmentPast={isAppointmentPast}
            handleJoinCall={handleJoinCall}
            handlePayNow={handlePayNow}
            showActions={true}
            maxRows={100}
          />
        </div>
      </div>
    </div>
  );
}

export default function ProtectedAppointmentsPage() {
  return (
    <RoleGuard allowedRoles={['doctor', 'patient']}>
      <AppointmentsPage />
    </RoleGuard>
  );
}