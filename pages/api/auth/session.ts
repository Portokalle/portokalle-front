import type { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';
import { UserRole } from '../../../src/models/UserRole';
import { setSecurityHeaders } from '../../../src/config/httpHeaders';

const THIRTY_MIN = 30 * 60; // seconds
const ENV_PRODUCTION = 'production';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { idToken } = req.body || {};
    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }

    // Verify the ID token using Firebase Admin
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const uid = decoded.uid;
    // Fetch user role from Firestore
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    let role = UserRole.Patient;
    if (userDoc.exists) {
      const data = userDoc.data();
      role = (data && Object.values(UserRole).includes(data.role)) ? data.role : UserRole.Patient;
    }

    const isProd = process.env.NODE_ENV === ENV_PRODUCTION;
    setSecurityHeaders(res, isProd);

    // Set cookies using server-fetched role
    res.setHeader('Set-Cookie', [
      // HttpOnly session cookie (not readable by JS)
      `session=1; Path=/; SameSite=Lax; Max-Age=${THIRTY_MIN}; HttpOnly${isProd ? '; Secure' : ''}`,
      // Role for client UI convenience (non-sensitive)
      `userRole=${encodeURIComponent(role)}; Path=/; SameSite=Lax; Max-Age=${THIRTY_MIN}${isProd ? '; Secure' : ''}`,
      // Sliding window helpers readable on client
      `lastActivity=${Date.now()}; Path=/; SameSite=Lax; Max-Age=${THIRTY_MIN}${isProd ? '; Secure' : ''}`,
      `loggedIn=1; Path=/; SameSite=Lax; Max-Age=${THIRTY_MIN}${isProd ? '; Secure' : ''}`,
    ]);

    return res.status(200).json({ ok: true });
  } catch (e: unknown) {
    // Log error for debugging
    console.error('Session API error:', e);
    const message = e instanceof Error ? e.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}
