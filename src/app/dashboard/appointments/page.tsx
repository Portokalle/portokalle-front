"use client";

import { useRouter } from "next/navigation";
import { useAppointments } from "../../hooks/useAppointments";

export default function AppointmentsPage() {
  const router = useRouter();
  const { appointments, isLoading, error } = useAppointments();

  if (error) {
    console.warn(error);
    return router.push("/login");
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-2">Loading appointments...</span>
      </div>
    );
  }

  const statusClasses = {
    completed: "badge badge-success",
    pending: "badge badge-warning",
    canceled: "badge badge-error",
  };

  return (
    <div className="card bg-base-100 shadow-xl p-6">
      <h1 className="card-title mb-4">Appointment History</h1>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Patient Name</th>
              <th>Notes</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{new Date(appointment.createdAt).toLocaleString()}</td>
                <td>{appointment.appointmentType}</td>
                <td>{appointment.patientName || "Unknown"}</td>
                <td>{appointment.notes}</td>
                <td>
                  <span className={statusClasses[appointment.status]}>
                    {appointment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
