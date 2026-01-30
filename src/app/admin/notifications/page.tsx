"use client";

import { useMemo, useState } from 'react';
import { ToastProvider } from '@/presentation/components/admin/ToastProvider';
import DashboardShell from '@/presentation/components/DashboardShell';
import { useTranslation } from 'react-i18next';
import '@i18n';
import { useAdminAppointments } from '@/presentation/hooks/useAdminAppointments';
import { AppointmentStatus } from '@/domain/entities/AppointmentStatus';
import GenericTable, { Column } from '@/presentation/components/GenericTable';
import type { Appointment } from '@/domain/entities/Appointment';
import { useDI } from '@/presentation/context/DIContext';

export default function AdminNotificationsPage() {
  const { t } = useTranslation();
  const { appointments, loading, error } = useAdminAppointments();
  const { adminGateway } = useDI();
  const [showRequests, setShowRequests] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const pendingRequests = useMemo(() => appointments
    .filter((appt) =>
      appt.status === AppointmentStatus.Pending &&
      !appt.dismissedByAdmin &&
      !dismissedIds.has(appt.id)
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.preferredDate).getTime();
      const dateB = new Date(b.createdAt || b.preferredDate).getTime();
      return dateB - dateA;
    }), [appointments, dismissedIds]);
  const pendingLimited = pendingRequests.slice(0, 5);

  const columns: Column<Appointment>[] = [
    { key: 'patientName', header: t('patientName', 'Patient') },
    { key: 'doctorName', header: t('doctor', 'Doctor') },
    { key: 'preferredDate', header: t('date', 'Date') },
    { key: 'preferredTime', header: t('time', 'Time') },
    { key: 'status', header: t('status', 'Status') },
  ];

  const [page, setPage] = useState(0);

  return (
    <ToastProvider>
      <DashboardShell>
        <div className="p-4 md:p-6">
          <h1 className="text-2xl font-bold mb-4">{t('notifications')}</h1>
          {loading && <p className="text-gray-600">{t('loading', 'Loading...')}</p>}
          {error && <p className="text-red-600">{error}</p>}

          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">{t('newAppointmentRequests', 'New appointment requests')}</h2>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  onClick={async () => {
                    if (pendingLimited.length === 0) return;
                    setClearing(true);
                    try {
                      await adminGateway.dismissAdminNotifications(pendingLimited.map((appt) => appt.id));
                      setDismissedIds((prev) => {
                        const next = new Set(prev);
                        pendingLimited.forEach((appt) => next.add(appt.id));
                        return next;
                      });
                    } finally {
                      setClearing(false);
                    }
                  }}
                  disabled={clearing || pendingLimited.length === 0}
                >
                  {t('clearNotifications', 'Clear notifications')}
                </button>
                <button
                  className="px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowRequests((prev) => !prev)}
                >
                  {showRequests ? t('hideNotifications', 'Hide notifications') : t('showNotifications', 'Show notifications')}
                </button>
              </div>
            </div>
            {showRequests && (
              pendingLimited.length === 0 ? (
                <p className="text-gray-600">{t('noNewAppointmentRequests', 'No new appointment requests')}</p>
              ) : (
                <div className="space-y-2">
                  {pendingLimited.map((appt) => (
                    <div key={appt.id} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                      <span className="font-medium">
                        {appt.patientName || t('unknown', 'Unknown')}
                      </span>
                      {' '}
                      {t('hasRequestedAppointmentWith', 'has requested an appointment with')}
                      {' '}
                      <span className="font-medium">
                        {appt.doctorName || t('unknown', 'Unknown')}
                      </span>
                      {appt.preferredDate && (
                        <>
                          {' '}· {appt.preferredDate} {appt.preferredTime || ''}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('allAppointments', 'All appointments')}</h2>
            <GenericTable
              data={appointments}
              columns={columns}
              page={page}
              pageSize={20}
              onPageChange={setPage}
              emptyText={t('noAppointmentsFound', 'No appointments found')}
            />
          </section>
        </div>
      </DashboardShell>
    </ToastProvider>
  );
}
