"use client";

import { useRouter } from "next/navigation";
import { useAppointmentsPage } from "../../hooks/useAppointmentsPage";
import Link from "next/link";
import { db } from "../../../../config/firebaseconfig"; // Import Firestore instance
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";

export default function AppointmentsPage() {
  const router = useRouter();
  const {
    user,
    role,
    authLoading,
    appointments,
    isLoading,
    error,
    appointmentDetails,
  } = useAppointmentsPage();

  const [loadingPayment, setLoadingPayment] = useState(false);

  const handlePayNow = async (appointmentId: string) => {
    console.log(`Pay Now clicked for appointment ID: ${appointmentId}`);
    // Add payment logic here
  };

  const handleJoinCall = (appointmentId: string) => {
    console.log(`Join Call clicked for appointment ID: ${appointmentId}`);
    // Add join call logic here
  };

  const checkPaymentStatus = async (appointmentId: string): Promise<boolean> => {
    try {
      const docRef = doc(db, "appointments", appointmentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().isPaid;
      } else {
        console.error("No such document!");
        return false;
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      return false;
    }
  };

  if (authLoading || isLoading || !role || appointmentDetails.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-2">Loading appointments...</span>
      </div>
    );
  }

  if (error) {
    console.warn(error);
    return router.push("/dashboard");
  }

  const statusClasses = {
    completed: "badge badge-success",
    pending: "badge badge-warning",
    canceled: "badge badge-error",
  };

  return (
    <div className="card bg-base-100 shadow-xl p-6">
      <h1 className="card-title mb-4">Dashboard</h1>
      {role === "doctor" && (
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
              {role === "patient" && <th>Action</th>}
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
                      ? role === "doctor"
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
                  {role === "patient" && (
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={async () => {
                          setLoadingPayment(true);
                          const isPaid = await checkPaymentStatus(appointment.id);
                          setLoadingPayment(false);
                          if (isPaid) {
                            handleJoinCall(appointment.id);
                          } else {
                            handlePayNow(appointment.id);
                          }
                        }}
                        disabled={loadingPayment}
                      >
                        {loadingPayment
                          ? "Checking..."
                          : appointment.isPaid
                          ? "Join Call"
                          : "Pay Now"}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}