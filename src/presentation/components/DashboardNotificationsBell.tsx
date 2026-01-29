'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDI } from '@/presentation/context/DIContext';

interface Notification {
  id: string;
  patientName: string;
  appointmentType: string;
  preferredDate: string;
  preferredTime: string;
}

export default function DashboardNotificationsBell({ doctorId }: { doctorId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { notificationService } = useDI();

  useEffect(() => {
    if (!doctorId) return;
    const unsubscribe = notificationService.subscribePendingAppointments(doctorId, (items) => {
      setNotifications(items as Notification[]);
    });
    return () => unsubscribe();
  }, [doctorId, notificationService]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-base text-gray-700">
        You have <span className="font-bold text-orange-500">{notifications.length}</span> notification{notifications.length !== 1 ? 's' : ''}
      </span>
      <Link href="/dashboard/notifications" className="text-orange-500 text-sm font-semibold hover:underline">
        View All
      </Link>
    </div>
  );
}
