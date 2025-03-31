"use client";

import { useRouter } from "next/navigation";
import { useAppointments } from "../../hooks/useAppointments";
import { useEffect, useState } from "react";
import { auth, db } from "../../../../config/firebaseconfig";
import { doc, getDoc, collection } from "firebase/firestore";
import Link from "next/link";

export default function AppointmentsPage() {
  const router = useRouter();
  const { appointments, isLoading, error } = useAppointments();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<
    { id: string; patientName: string | null; doctorName: string | null }[]
  >([]);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!auth.currentUser) {
        router.push("/login");
        return;
      }

      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserRole(userSnap.data().role);
      } else {
        console.warn("User not found");
        router.push("/login");
      }
    };

    fetchUserRole();
  }, [router]);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      const details = await Promise.all(
        appointments.map(async (appointment) => {
          try {
            const appointmentRef = doc(collection(db, "appointments"), appointment.id);
            const appointmentSnap = await getDoc(appointmentRef);

            if (!appointmentSnap.exists()) {
              throw new Error("Appointment not found");
            }

            const { patientId, doctorId } = appointmentSnap.data();

            let patientName: string | null = null;
            let doctorName: string | null = null;

            if (patientId) {
              const patientRef = doc(collection(db, "users"), patientId);
              const patientSnap = await getDoc(patientRef);
              if (patientSnap.exists()) {
                patientName = patientSnap.data().name;
              }
            }

            if (doctorId) {
              const doctorRef = doc(collection(db, "users"), doctorId);
              const doctorSnap = await getDoc(doctorRef);
              if (doctorSnap.exists()) {
                doctorName = doctorSnap.data().name;
              }
            }

            return { 
              id: appointment.id, 
              patientName, 
              doctorName 
            };
          } catch (err) {
            console.error(`Error fetching details for appointment ${appointment.id}:`, err);
            return { id: appointment.id, patientName: null, doctorName: null };
          }
        })
      );
      setAppointmentDetails(details);
    };

    if (appointments.length > 0) {
      fetchAppointmentDetails();
    }
  }, [appointments]);

  if (error) {
    console.warn(error);
    return router.push("/dashboard");
  }

  if (isLoading || !userRole || appointmentDetails.length === 0) {
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
      <h1 className="card-title mb-4">Dashboard</h1>
      {userRole === "doctor" && (
        <div className="mb-6">
          <div className="card bg-base-200 shadow-md p-4">
            <h2 className="text-lg font-bold mb-2">Notifications</h2>
            <p className="mb-2">
              You have pending appointment requests. Manage them in the notifications section.
            </p>
            <Link href="/dashboard/notifications">
              <button className="btn btn-primary btn-sm">View Notifications</button>
            </Link>
          </div>
        </div>
      )}
      <h2 className="card-title mb-4">Appointment History</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Type</th>
              <th>Name</th>
              <th>Notes</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => {
              const details = appointmentDetails.find((d) => d.id === appointment.id);

              return (
                <tr key={appointment.id}>
                  <td>
                    {appointment.preferredDate && appointment.preferredTime
                      ? `${appointment.preferredDate} at ${appointment.preferredTime}`
                      : "N/A"}
                  </td>
                  <td>{appointment.appointmentType}</td>
                  <td>
                    {details
                      ? userRole === "doctor"
                        ? details.patientName || "Unknown"
                        : details.doctorName || "Unknown"
                      : "Loading..."}
                  </td>
                  <td>{appointment.notes}</td>
                  <td>
                    <span className={statusClasses[appointment.status]}>
                      {appointment.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
