'use client';

import { useState, useEffect } from 'react';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { fetchAppointments } from '../../../services/appointmentsService';
import { useTranslation } from 'react-i18next';

interface Appointment {
  id: string;
  doctorId: string;
  appointmentType: string;
  // Add other fields as needed
}

export default function UpcomingRequestsPage() {
  const [requests, setRequests] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigationCoordinator();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const fetchedRequests = await fetchAppointments('pending', false);
        setRequests(fetchedRequests);
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        } else {
          alert(t('unknownError'));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [t]);

  const handleJoin = (requestId: string) => {
    nav.toChatRoom(requestId);
  };

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{t('upcomingRequests')}</h1>
      {requests.length === 0 ? (
        <p>{t('noUpcomingRequests')}</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title">{t('appointmentWith', { doctorId: request.doctorId })}</h2>
                <p>{t('appointmentType', { appointmentType: request.appointmentType })}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => handleJoin(request.id)}
                >
                  {t('join')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
  