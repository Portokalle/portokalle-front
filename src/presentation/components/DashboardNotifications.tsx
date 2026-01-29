'use client';

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
      setNotifications(items as Notification[]);
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
          <div key={notification.id} className="notification-item p-3 border-b">
            <p>
              {t('appointmentRequestText', {
                patientName: notification.patientName,
                appointmentType: notification.appointmentType,
                preferredDate: notification.preferredDate,
                preferredTime: notification.preferredTime,
              })}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
