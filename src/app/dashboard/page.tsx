'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useDashboardStore } from '../../store/dashboardStore';
import Link from 'next/link';
import { isProfileIncomplete } from '../../store/generalStore';
import DashboardDoctorSearchBar from '../components/DashboardDoctorSearchBar';
import { useRouter } from 'next/navigation';
import { doctorProfilePath } from '@/navigation/NavigationCoordinator';
import { UserRole } from '@/domain/entities/UserRole';
import DashboardNotificationsBell from '../components/DashboardNotificationsBell';
import Loader from '../components/Loader';
import { useAppointmentStore } from '../../store/appointmentStore';
import { AppointmentsTable } from '../components/AppointmentsTable';
import RedirectingModal from '../components/RedirectingModal';
import UpcomingAppointment from '../components/UpcomingAppointment';
import { useDashboardActions } from '../../hooks/useDashboardActions';
import ProfileWarning from '../components/ProfileWarning';

export default function Dashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const [showRedirecting, setShowRedirecting] = useState(false);
  const { user, role, loading: authLoading } = useAuth();
  const { totalAppointments, fetchAppointments } = useDashboardStore();
  const { appointments, isAppointmentPast, fetchAppointments: fetchAllAppointments } = useAppointmentStore();
  const { handleJoinCall: baseHandleJoinCall, handlePayNow } = useDashboardActions();
  const [profileIncomplete, setProfileIncomplete] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  // Wrap handleJoinCall to show modal
  const handleJoinCall = async (appointmentId: string) => {
    setShowRedirecting(true);
    try {
      await baseHandleJoinCall(appointmentId);
    } catch {
      setShowRedirecting(false);
      // baseHandleJoinCall already alerts on error
    }
  };

  const fetchProfileStatus = useCallback(async () => {
    if (user && role) {
      const incomplete = await isProfileIncomplete(role, user.uid);
      setProfileIncomplete(incomplete);
    }
  }, [user, role]);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        await fetchProfileStatus();
        if (user && role) {
          await fetchAppointments(user.uid, role);
          await fetchAllAppointments(user.uid, role === UserRole.Doctor); // Ensure appointments store is also loaded
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000); // 5 second timeout

    if (!authLoading) {
      initializeDashboard();
    }

    return () => clearTimeout(timeout);
  }, [user, role, fetchAppointments, fetchProfileStatus, fetchAllAppointments, authLoading]);

  if (authLoading || loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8">
      <RedirectingModal show={showRedirecting} />
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
        {t('welcomeToDashboard', { role: role || t('user') })}
      </h1>
      {role === UserRole.Patient && (
        <DashboardDoctorSearchBar />
      )}
      <ProfileWarning show={profileIncomplete} />
      {role === UserRole.Doctor && user?.uid && (
        <div className="mb-6 flex items-center justify-end">
          <DashboardNotificationsBell doctorId={user.uid} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">{t('totalAppointments')}</div>
            <div className="stat-value">{totalAppointments}</div>
          </div>
        </div>
        <UpcomingAppointment />
      </div>
      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h2 className="card-title text-lg md:text-2xl">{t('yourAppointments')}</h2>
            <Link href="/dashboard/appointments" className="text-orange-500 hover:underline">
              {t('viewAll')}
            </Link>
          </div>
          <AppointmentsTable
            appointments={appointments}
            role={role || ''}
            isAppointmentPast={isAppointmentPast}
            handleJoinCall={handleJoinCall}
            handlePayNow={handlePayNow}
          />
        </div>
      </div>
    </div>
  );
}