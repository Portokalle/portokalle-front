"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDI } from '@/presentation/context/DIContext';

interface Notification {
  id: string;
  patientName: string;
  appointmentType: string;
  preferredDate: string;
  preferredTime: string;
}

export default function DashboardNotifications({ doctorId }: { doctorId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { t } = useTranslation();
  const { notificationService } = useDI();

  useEffect(() => {
    if (!doctorId) {
      return;
    }
    const unsubscribe = notificationService.subscribePendingAppointments(doctorId, (items) => {
      const filtered = items.filter((item) => {
        const dismissedBy = (item as unknown as { dismissedBy?: Record<string, boolean> }).dismissedBy;
        return !dismissedBy?.[doctorId];
      });
      setNotifications(filtered as Notification[]);
    });

    return () => unsubscribe();
  }, [doctorId, notificationService]);

  return (
    <div className="notifications">
      <h2 className="text-xl font-bold mb-4">{t('newAppointmentRequests')}</h2>
      {notifications.length === 0 ? (
        <p>{t('noNewAppointmentRequests')}</p>
      ) : (
        notifications.map((notification) => (
          <div key={notification.id} className="notification-item p-3 border-b flex justify-between items-center">
            <p>
              {t('appointmentRequestText', {
                patientName: notification.patientName,
                appointmentType: notification.appointmentType,
                preferredDate: notification.preferredDate,
                preferredTime: notification.preferredTime,
              })}
            </p>
            <button
              className="ml-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              onClick={async () => {
                await notificationService.dismissNotification(notification.id, doctorId);
              }}
            >
              {t('dismiss')}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
