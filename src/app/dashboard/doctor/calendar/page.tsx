'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RoleGuard from '../../../components/RoleGuard';
import { UserRole } from '../../../../models/UserRole';
import Calendar from '../Calendar';
import Loader from '../../../components/Loader';
import { useAuth } from '../../../../context/AuthContext';
import { fetchAppointments } from '../../../../services/appointmentsService';
import { Event as RBCEvent } from 'react-big-calendar';

export default function DoctorCalendarPage() {
  const { t } = useTranslation();
  const { user } = useAuth(); // Use the hook instead of useContext
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<RBCEvent[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (user?.uid) {
          // Fetch only appointments for this doctor
          const appointments = await fetchAppointments(user.uid, true); // true = isDoctor
          // Map appointments to calendar events
          const mappedEvents = appointments
            .filter(app => app.preferredDate && app.preferredTime)
            .map(app => {
              // Combine date and time into a Date object
              const start = new Date(`${app.preferredDate}T${app.preferredTime}`);
              // Example: 30 min duration
              const end = new Date(start.getTime() + 30 * 60 * 1000);
              return {
                title: `${app.appointmentType || t('appointment')}${app.patientName ? ` ${t('with')} ${app.patientName}` : ''}`,
                start,
                end,
                resource: app, // pass the whole appointment as resource for extra info
              };
            });
          setEvents(mappedEvents);
        }
  } catch {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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
