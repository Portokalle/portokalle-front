// Fetch appointments for a user (doctor or patient)
import { Appointment } from "@/models/Appointment";
import { query, where, getDocs } from "firebase/firestore";

export async function fetchAppointments(userId: string, isDoctor: boolean): Promise<Appointment[]> {
  if (!userId) throw new Error("User ID is missing");
  const appointmentsRef = collection(db, FirestoreCollections.Appointments);
  const q = query(
    appointmentsRef,
    where(isDoctor ? "doctorId" : "patientId", "==", userId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Appointment));
}
import { getDefaultPatientName, getDefaultStatus } from "@/utils/userUtils";
import { collection, doc, addDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebaseconfig";
import { getAuth } from "firebase/auth";
import { createPaymentIntent, verifyPayment } from "@/network/apiClient+payment";
import { getUserPhoneNumber } from "@/services/userService";
import { sendDoctorAppointmentRequestSMS } from "@/services/smsService";

import { FirestoreCollections } from "@/models/FirestoreConstants";
import type { AppointmentPayload } from "@/models/AppointmentPayload";
import type { BookAppointmentPayload } from "@/models/BookAppointmentPayload";
import { updateSlotStatus } from "@/utils/slotUtils";
import { SlotStatus } from "@/models/SlotStatus";
import { USER_ROLE_PATIENT } from "@/config/userRoles";


// Mark appointment as paid
export async function setAppointmentPaid(appointmentId: string): Promise<void> {
  const appointmentRef = doc(db, FirestoreCollections.Appointments, appointmentId);
  await updateDoc(appointmentRef, { isPaid: true });
}

// Handle Stripe payment
export async function handlePayNow(appointmentId: string, amount: number): Promise<void> {
  const { data, status } = await createPaymentIntent(appointmentId, amount);
  if (status === 200 && data.url) {
    window.location.href = data.url;
  } else {
    throw new Error("Failed to create payment intent");
  }
}

// Check if appointment is past by id
export async function checkIfPastAppointment(appointmentId: string): Promise<boolean> {
  const appointmentRef = doc(db, FirestoreCollections.Appointments, appointmentId);
  const appointmentDoc = await getDoc(appointmentRef);
  if (!appointmentDoc.exists()) {
    return false;
  }
  const appointmentData = appointmentDoc.data();
  const appointmentDateTime = new Date(`${appointmentData.preferredDate}T${appointmentData.preferredTime}`);
  const appointmentEndTime = new Date(appointmentDateTime.getTime() + 30 * 60000);
  return appointmentEndTime < new Date();
}

// Verify Stripe payment and update paid status
export async function verifyStripePayment(appointmentId: string, setAppointmentPaid: (id: string) => Promise<void>): Promise<void> {
  const { data, status } = await verifyPayment(appointmentId);
  if (status !== 200) {
    throw new Error("Failed to verify payment");
  }
  if (data.isPaid) {
    await setAppointmentPaid(appointmentId);
  }
}

export async function getUserRole(userId: string): Promise<string> {
  try {
    const snap = await getDoc(doc(db, FirestoreCollections.Users, userId));
    return snap.exists() ? (snap.data().role ?? USER_ROLE_PATIENT) : USER_ROLE_PATIENT;
  } catch {
    return USER_ROLE_PATIENT;
  }
}

async function createAndNotifyAppointment(payload: AppointmentPayload): Promise<{ id: string } & AppointmentPayload> {
  const appointment = { ...payload, createdAt: new Date().toISOString() };
  try {
    const docRef = await addDoc(collection(db, FirestoreCollections.Appointments), appointment);
    const doctorPhone = await getUserPhoneNumber(payload.doctorId);
    if (doctorPhone) await sendDoctorAppointmentRequestSMS(doctorPhone, payload.patientName);
    return { id: docRef.id, ...appointment };
  } catch {
    throw new Error('Failed to book appointment.');
  }
}

export async function bookAppointment(appointmentData: BookAppointmentPayload): Promise<{ id: string } & AppointmentPayload> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated. Please log in.");
  const payload: AppointmentPayload = {
    ...appointmentData,
    status: getDefaultStatus(appointmentData.status),
    patientId: user.uid,
  patientName: getDefaultPatientName(user.displayName ?? undefined),
  };
  return createAndNotifyAppointment(payload);
}

export async function markSlotAsPending(doctorId: string, date: string, time: string): Promise<void> {
  await updateSlotStatus(doctorId, date, time, SlotStatus.Pending);
}

export async function markSlotAsBooked(doctorId: string, date: string, time: string): Promise<void> {
  await updateSlotStatus(doctorId, date, time, SlotStatus.Booked);
}

export async function markSlotAsAvailable(doctorId: string, date: string, time: string): Promise<void> {
  await updateSlotStatus(doctorId, date, time, SlotStatus.Available);
}
