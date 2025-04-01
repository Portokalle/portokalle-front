'use client';

import { useState, useEffect } from 'react';
import { fetchDoctors, Doctor } from '../services/doctorService';
import { useRouter } from 'next/navigation';

interface DoctorSearchProps {
  onDoctorSelect?: (doctor: Doctor) => void;
}

export default function DoctorSearch({ onDoctorSelect }: DoctorSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOverlayVisible, setIsOverlayVisible] = useState(false); // Track overlay visibility
  const router = useRouter();

  const closeSearch = () => {
    setIsOverlayVisible(false); // Hide the overlay first
    setTimeout(() => {
      setSearchTerm('');
      setFilteredDoctors([]);
    }, 300); // Match the CSS transition duration of the overlay (300ms)
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length >= 4) { // Trigger search after 4 characters
        setLoading(true);
        setError('');
        setIsOverlayVisible(true); // Show the overlay
        try {
          const doctors = await fetchDoctors(searchTerm.trim());
          setFilteredDoctors(doctors);
        } catch (err) {
          console.error('Error fetching doctors:', err);
          setError('Failed to fetch doctors. Please try again.');
        } finally {
          setLoading(false);
        }
      } else if (searchTerm.trim().length === 0) { // Hide overlay when search bar is empty
        setIsOverlayVisible(false);
        setFilteredDoctors([]);
      }
    }, 1000); // 1-second delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <>
      {isOverlayVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-40 transition-opacity duration-300" // Add transition for smooth fade-out
          onClick={closeSearch} // Close search when clicking outside
        ></div>
      )}

      <div className="relative z-50"> {/* Ensure the search bar and results are above the overlay */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search doctors by name or specializations..."
            className="input input-bordered w-full"
            value={searchTerm}
            onFocus={() => setIsOverlayVisible(true)} // Show overlay when input is focused
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {filteredDoctors.length > 0 && (
          <ul className="absolute z-50 w-full bg-base-100 shadow-lg rounded-lg overflow-hidden">
            {filteredDoctors.map((doctor, index) => (
              <li
                key={`${doctor.id}-${index}`} // Ensure the key is unique
                className="p-4 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  if (onDoctorSelect) {
                    onDoctorSelect(doctor);
                  } else {
                    router.push(`/dashboard/doctor/${doctor.id}`);
                  }
                  closeSearch(); // Close search after selecting a doctor
                }}
              >
                <div className="font-bold">{doctor.name}</div>
                <div className="text-sm text-gray-500">
                  {doctor.specializations?.join(', ') || 'No specializations'}
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && searchTerm.length >= 4 && filteredDoctors.length === 0 && (
          <p className="text-center text-gray-500">No doctors found.</p>
        )}
      </div>
    </>
  );
}