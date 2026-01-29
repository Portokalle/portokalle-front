import { useState, useEffect } from 'react';
import { Doctor } from '@/domain/entities/Doctor';
import { useDI } from '@/presentation/context/DIContext';


export const useDoctorProfile = (id: string) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { userRepository } = useDI();

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        // Use repository to fetch doctor profile
        const user = await userRepository.getById(id);
        if (user && user.name) {
          setDoctor({
            id: user.id,
            name: user.name,
            specialization: user.specialization ?? [],
            profilePicture: user.profilePicture,
          });
        } else {
          setError('Doctor not found');
        }
      } catch {
        setError('Failed to fetch doctor data');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id, userRepository]);

  return { doctor, loading, error };
};
