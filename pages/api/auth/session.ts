import type { NextApiRequest, NextApiResponse } from 'next';

// Simple server-side session cookie setter.
// TODO: Verify idToken using Firebase Admin SDK for stronger security.

const THIRTY_MIN = 30 * 60; // seconds

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { idToken, role } = req.body || {};
    if (!idToken || !role) {
      return res.status(400).json({ error: 'Missing idToken or role' });
    }

    // Minimal sanity check to avoid empty tokens; real apps: verify with Firebase Admin
    if (typeof idToken !== 'string' || idToken.length < 100) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const isProd = process.env.NODE_ENV === 'production';

    // Opaque HttpOnly session marker cookie. Consider signing or using a backend session store.
    // For now we just set a static marker value.
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
    const message = e instanceof Error ? e.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}
