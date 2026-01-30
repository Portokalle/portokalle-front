import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import admin from "firebase-admin";
import { FirestoreCollections } from "@/infrastructure/firebase/FirestoreCollections";

// ------------------------
// FIREBASE ADMIN INIT (robust)
// ------------------------
function getServiceAccountFromEnv(): admin.ServiceAccount | null {
  const envJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!envJson) return null;
  try {
    const sa: Partial<admin.ServiceAccount> & { private_key?: string } = JSON.parse(envJson);
    if (typeof sa.private_key === "string") {
      sa.private_key = sa.private_key.replace(/\\n/g, "\n");
    }
    return sa as admin.ServiceAccount;
  } catch (e) {
    console.warn("FIREBASE_SERVICE_ACCOUNT env is invalid JSON.", e);
    return null;
  }
}

function ensureAdmin(): boolean {
  if (admin.apps.length) return true;

  const sa = getServiceAccountFromEnv();
  if (sa) {
    try {
      admin.initializeApp({ credential: admin.credential.cert(sa) });
      return true;
    } catch (e) {
      console.error("Firebase Admin init with env service account failed:", e);
    }
  }

  try {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
    return true;
  } catch (e) {
    console.error("Firebase Admin init with application default failed:", e);
    return false;
  }
}
// ------------------------

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { appointmentId, amount } = req.body;

  if (!appointmentId || !amount) {
    return res.status(400).json({ error: "Missing required fields: appointmentId or amount" });
  }

  try {
    let patientName: string | undefined;
    let doctorName: string | undefined;
    let patientId: string | undefined;
    let doctorId: string | undefined;
    let patientEmail: string | undefined;

    if (ensureAdmin()) {
      const db = admin.firestore();
      const appointmentSnap = await db
        .collection(FirestoreCollections.Appointments)
        .doc(appointmentId)
        .get();

      if (appointmentSnap.exists) {
        const appointment = appointmentSnap.data() as {
          patientId?: string;
          patientName?: string;
          doctorId?: string;
          doctorName?: string;
        };
        patientId = appointment.patientId;
        doctorId = appointment.doctorId;
        patientName = appointment.patientName;
        doctorName = appointment.doctorName;

        if (patientId && (!patientName || !patientEmail)) {
          const userSnap = await db.collection(FirestoreCollections.Users).doc(patientId).get();
          if (userSnap.exists) {
            const user = userSnap.data() as { name?: string; email?: string };
            patientName = patientName ?? user.name;
            patientEmail = user.email;
          }
        }
      }
    }

    const displayName = patientName || "Patient";
    const productName = patientName
      ? `Appointment Payment for ${displayName}`
      : `Appointment Payment for ${appointmentId}`;

    const metadata = Object.fromEntries(
      Object.entries({
        appointmentId,
        patientId,
        patientName,
        doctorId,
        doctorName,
      }).filter(([, value]) => typeof value === "string" && value.length > 0)
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/appointments?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/appointments`,
      client_reference_id: appointmentId,
      metadata,
      payment_intent_data: { metadata },
      ...(patientEmail ? { customer_email: patientEmail } : {}),
    });

    res.status(200).json({ url: session.url });
  } catch {
    res.status(500).json({ error: "Failed to create checkout session" });
  }
}
