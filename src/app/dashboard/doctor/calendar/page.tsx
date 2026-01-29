'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RoleGuard from '@/presentation/components/RoleGuard';
import { UserRole } from '@/domain/entities/UserRole';
import Calendar from '@/presentation/components/dashboard/DoctorCalendar';
import Loader from '@/presentation/components/Loader';
import { useAuth } from '@/presentation/context/AuthContext';
import { useAppointmentStore } from '@/presentation/store/appointmentStore';
import { Event as RBCEvent } from 'react-big-calendar';
import { useDI } from '@/presentation/context/DIContext';

export default function DoctorCalendarPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { appointments, fetchAppointments, loading } = useAppointmentStore();
  const [events, setEvents] = useState<RBCEvent[]>([]);
  const { fetchAppointmentsUseCase } = useDI();

  useEffect(() => {
    if (!user?.uid) return;
    fetchAppointments(user.uid, true, (userId: string, isDoctor: boolean) => fetchAppointmentsUseCase.execute(userId, isDoctor));
  }, [user, fetchAppointments, fetchAppointmentsUseCase]);

  useEffect(() => {
    // Map appointments to calendar events whenever appointments change
    const mappedEvents = appointments
      .filter(app => app.preferredDate && app.preferredTime)
      .map(app => {
        const start = new Date(`${app.preferredDate}T${app.preferredTime}`);
        const end = new Date(start.getTime() + 30 * 60 * 1000);
        return {
          title: `${app.appointmentType || t('appointment')}${app.patientName ? ` ${t('with')} ${app.patientName}` : ''}`,
          start,
          end,
          resource: app,
        };
      });
    setEvents(mappedEvents);
  }, [appointments, t]);

  if (loading) {
    return <Loader />;
  }

  return (
    <RoleGuard allowedRoles={[UserRole.Doctor]} fallbackPath="/dashboard">
      <div>
        <h1 className="text-2xl font-bold">{t('doctorCalendar')}</h1>
        <Calendar events={events} />
      </div>
    </RoleGuard>
  );
}
