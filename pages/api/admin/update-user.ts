import type { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';

// ------------------------
// FIREBASE ADMIN INIT
// ------------------------
// Initialize Admin SDK once using FIREBASE_SERVICE_ACCOUNT environment variable
if (!admin.apps.length) {
  let serviceAccount;
  try {
    const envVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!envVar) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
    }
    serviceAccount = JSON.parse(envVar);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'FIREBASE_SERVICE_ACCOUNT env is not valid JSON.';
    console.error(message);
    throw new Error(message);
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
// ------------------------

type UserFields = {
  name?: string;
  surname?: string;
  role?: string;
  email?: string;
};

type DoctorFields = {
  specialization?: string;
  bio?: string;
  specializations?: string[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
  // Verify admin using Firebase ID token from Authorization header (Bearer) or cookie
  const isAdmin = await verifyAdminFromRequest(req);
    if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });

    const { id, userFields, doctorFields } = req.body as { id: string; userFields?: UserFields; doctorFields?: DoctorFields };
    if (!id) return res.status(400).json({ error: 'Missing user id' });

    const db = admin.firestore();

    // Update base user fields
    if (userFields && Object.keys(userFields).length > 0) {
      const safeUser: Record<string, unknown> = {};
      if (userFields.name !== undefined) safeUser.name = userFields.name ?? '';
      if (userFields.surname !== undefined) safeUser.surname = userFields.surname ?? '';
      if (userFields.email !== undefined) safeUser.email = userFields.email ?? '';
      if (userFields.role !== undefined) safeUser.role = userFields.role ?? 'user';
      await db.collection('users').doc(id).set(safeUser, { merge: true });

      // If role changed to non-doctor, clear doctor subprofile
      if (userFields.role && userFields.role !== 'doctor') {
        await db.collection('users').doc(id).collection('doctors').doc(id).set({ specialization: '', bio: '', specializations: [] }, { merge: true });
      }
    }

    // Update doctor fields (if provided)
    if (doctorFields && Object.keys(doctorFields).length > 0) {
      const safeDoc: Record<string, unknown> = {};
      if (doctorFields.specialization !== undefined) safeDoc.specialization = doctorFields.specialization ?? '';
      if (doctorFields.bio !== undefined) safeDoc.bio = doctorFields.bio ?? '';
      if (doctorFields.specializations !== undefined) safeDoc.specializations = Array.isArray(doctorFields.specializations) ? doctorFields.specializations : [];
      await db.collection('users').doc(id).collection('doctors').doc(id).set(safeDoc, { merge: true });
    }

    return res.status(200).json({ ok: true });
  } catch (e: unknown) {
    console.error('Admin update-user error:', e);
    const message = typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : 'Internal Server Error';
    return res.status(500).json({ error: message });
  }
}

async function verifyAdminFromRequest(req: NextApiRequest): Promise<boolean> {
  try {
    // Prefer Authorization header: "Bearer <ID_TOKEN>"
    const auth = req.headers.authorization;
    let idToken: string | null = null;
    if (auth && auth.startsWith('Bearer ')) {
      idToken = auth.substring('Bearer '.length);
    }

    // Optional: look for a cookie named "__session" or "token" if using cookie-based tokens
    if (!idToken && req.cookies) {
      idToken = req.cookies.__session || req.cookies.token || null;
    }

    if (!idToken) return false;

    const decoded = await admin.auth().verifyIdToken(idToken);
    // Accept either a custom claim admin: true or role === 'admin'
    const claimAdmin = (
      ('admin' in decoded && (decoded as { admin?: boolean }).admin === true) ||
      ('role' in decoded && (decoded as { role?: string }).role === 'admin')
    );
    if (claimAdmin) return true;

    // Fallback: check Firestore user doc role
    const uid = decoded.uid;
    const db = admin.firestore();
    const snap = await db.collection('users').doc(uid).get();
    const role = snap.exists ? (snap.data()?.role as string | undefined) : undefined;
    return role === 'admin';
  } catch (e: unknown) {
    console.warn('verifyAdminFromRequest failed:', e);
    return false;
  }
}
