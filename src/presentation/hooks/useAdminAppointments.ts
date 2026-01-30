import { useEffect, useMemo, useState } from 'react';
import type { Appointment } from '@/domain/entities/Appointment';
import { useDI } from '@/presentation/context/DIContext';

export function useAdminAppointments() {
  const { appointmentRepository } = useDI();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await appointmentRepository.getAll();
        if (!active) return;
        setAppointments(data);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Failed to load appointments');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [appointmentRepository]);

  const sorted = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.preferredDate).getTime();
      const dateB = new Date(b.createdAt || b.preferredDate).getTime();
      return dateB - dateA;
    });
  }, [appointments]);

  return { appointments: sorted, loading, error };
}
