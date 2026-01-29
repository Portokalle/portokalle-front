
"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/presentation/context/AuthContext";
import { useDashboardStore } from "@/presentation/store/dashboardStore";
import { useAppointmentStore } from "@/presentation/store/appointmentStore";
import { isProfileIncomplete } from "@/presentation/store/generalStore";
import { useDashboardActions } from "@/presentation/hooks/useDashboardActions";
import { UserRole } from "@/domain/entities/UserRole";
import Link from "next/link";
import Loader from "@/presentation/components/Loader";
import RedirectingModal from "@/presentation/components/RedirectingModal";
import ProfileWarning from "@/presentation/components/ProfileWarning";
import DashboardDoctorSearchBar from "@/presentation/components/DashboardDoctorSearchBar";
import DashboardNotificationsBell from "@/presentation/components/DashboardNotificationsBell";
import UpcomingAppointment from "@/presentation/components/appointment/UpcomingAppointment";
import AppointmentsTable from "@/presentation/components/appointment/AppointmentsTable";
import { useDI } from "@/presentation/context/DIContext";


export default function Dashboard() {
  const { t } = useTranslation();
  const { user, role, loading: authLoading } = useAuth();
  const { totalAppointments, fetchAppointments } = useDashboardStore();
  const { appointments, isAppointmentPast, fetchAppointments: fetchAllAppointments } = useAppointmentStore();
  const { handleJoinCall: baseHandleJoinCall, handlePayNow } = useDashboardActions();
  const { checkProfileCompleteUseCase, fetchAppointmentsUseCase } = useDI();
  const [showRedirecting, setShowRedirecting] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(true);
  const [loading, setLoading] = useState(true);


  // Show modal and join call
  const handleJoinCall = async (appointmentId: string) => {
    setShowRedirecting(true);
    try {
      await baseHandleJoinCall(appointmentId);
    } finally {
      setShowRedirecting(false);
    }
  };

  // Fetch profile status and appointments
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const fetchAll = async () => {
      try {
        if (user && role) {
          setProfileIncomplete(await isProfileIncomplete(role, user.uid, checkProfileCompleteUseCase));
          await Promise.all([
            fetchAppointments(user.uid, role, fetchAppointmentsUseCase.execute.bind(fetchAppointmentsUseCase)),
            fetchAllAppointments(user.uid, role === UserRole.Doctor, fetchAppointmentsUseCase.execute.bind(fetchAppointmentsUseCase))
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) {
      fetchAll();
      timeout = setTimeout(() => setLoading(false), 5000);
    }
    return () => timeout && clearTimeout(timeout);
  }, [user, role, fetchAppointments, fetchAllAppointments, authLoading, checkProfileCompleteUseCase, fetchAppointmentsUseCase]);

  if (authLoading || loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8">
      <RedirectingModal show={showRedirecting} />
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
        {t("welcomeToDashboard", { role: role || t("user") })}
      </h1>
      {role === UserRole.Patient && <DashboardDoctorSearchBar />}
      <ProfileWarning show={profileIncomplete} />
      {role === UserRole.Doctor && user?.uid && (
        <div className="mb-6 flex items-center justify-end">
          <DashboardNotificationsBell doctorId={user.uid} />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">{t("totalAppointments")}</div>
            <div className="stat-value">{totalAppointments}</div>
          </div>
        </div>
        <UpcomingAppointment />
      </div>
      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h2 className="card-title text-lg md:text-2xl">{t("yourAppointments")}</h2>
            <Link href="/dashboard/appointments" className="text-orange-500 hover:underline">
              {t("viewAll")}
            </Link>
          </div>
          <AppointmentsTable
            appointments={appointments}
            role={role || ""}
            isAppointmentPast={isAppointmentPast}
            handleJoinCall={handleJoinCall}
            handlePayNow={handlePayNow}
          />
        </div>
      </div>
    </div>
  );
}
