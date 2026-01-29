import { useState, useEffect } from 'react';
import { useNewAppointmentStore } from '@/presentation/store/newAppointmentStore';
import { Appointment } from '@/domain/entities/Appointment';
import { AppointmentStatus } from '@/domain/entities/AppointmentStatus';
import { useAuth } from '@/presentation/context/AuthContext';
import { useDI } from '@/presentation/context/DIContext';
import { addMinutes, format, isSameDay, isBefore, startOfDay } from 'date-fns';

export default function useNewAppointment() {
  const {
    selectedDoctor,
    setSelectedDoctor,
    appointmentType,
    setAppointmentType,
    preferredDate,
    setPreferredDate,
    preferredTime,
    setPreferredTime,
    notes,
    setNotes,
    resetAppointment,
  } = useNewAppointmentStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading] = useState(false);
  const [patientName, setPatientName] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<{ time: string; disabled: boolean }[]>();
  const { user } = useAuth();
  const { appointmentRepository, createAppointmentUseCase } = useDI();

  useEffect(() => {
    if (user?.name) {
      setPatientName(user.name);
    }
  }, [user]);

  useEffect(() => {
    if (preferredDate) {
      const now = new Date();
      const selectedDate = startOfDay(new Date(preferredDate));
      const times: { time: string; disabled: boolean }[] = [];

      for (let minutes = 0; minutes < 24 * 60; minutes += 30) {
        const time = addMinutes(selectedDate, minutes);
        const formattedTime = format(time, 'hh:mm a');
        const isDisabled = isSameDay(time, now) && isBefore(time, now);

        times.push({
          time: formattedTime,
          disabled: isDisabled,
        });
      }

      setAvailableTimes(times);
    } else {
      setAvailableTimes([]);
    }
  }, [preferredDate]);

  const checkAppointmentExists = async (
    patientId: string,
    doctorId: string,
    preferredDate: string,
    preferredTime: string
  ): Promise<boolean> => {
  // Use repository method for existence check
  const appointments = await appointmentRepository.getByUser(patientId, false);
  return appointments.some(a => a.doctorId === doctorId && a.preferredDate === preferredDate && a.preferredTime === preferredTime);
  };

  const handleSubmit = async (
    e: React.FormEvent,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    setProgress: React.Dispatch<React.SetStateAction<number>>
  ) => {
    e.preventDefault();

    if (isSubmitting || !selectedDoctor) {

      return;
    }

    if (!user || !user.uid || !user.name) {

      return;
    }

    setIsSubmitting(true);
    const appointmentData: Omit<Appointment, 'id'> = {
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      patientId: user.uid,
      patientName: user.name,
      appointmentType,
      preferredDate,
      preferredTime,
      notes,
      isPaid: false,
      createdAt: new Date().toISOString(),
      status: AppointmentStatus.Pending,
    };
    try {
      const exists = await checkAppointmentExists(
        appointmentData.patientId,
        appointmentData.doctorId,
        appointmentData.preferredDate,
        appointmentData.preferredTime
      );
      if (exists) {
        setIsSubmitting(false);
        return;
      }
  // Use application layer use case for creation
  await createAppointmentUseCase.execute(appointmentData as Appointment);
      resetAppointment();
      setShowModal(true);
      let progressValue = 100;
      const interval = setInterval(() => {
        progressValue -= 10;
        setProgress(progressValue);
        if (progressValue <= 0) {
          clearInterval(interval);
        }
      }, 300);
    } catch {
      setIsSubmitting(false);
    }
  };

  return {
    selectedDoctor,
    setSelectedDoctor,
    appointmentType,
    setAppointmentType,
    preferredDate,
    setPreferredDate,
    preferredTime,
    setPreferredTime,
    notes,
    setNotes,
    resetAppointment,
    handleSubmit,
    isSubmitting,
    loading, // Return loading
    patientName,
    availableTimes,
  };
}
