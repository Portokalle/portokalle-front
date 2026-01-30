import { NextRequest, NextResponse } from 'next/server';
import { getAdmin } from '../../_lib/admin';
import { UserRole, toUserRole } from '@/domain/entities/UserRole';

export async function POST(req: NextRequest) {
  const role = toUserRole(req.cookies.get('userRole')?.value);
  if (role !== UserRole.Admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  if (!body || !body.email || !body.password || !body.name || !body.surname) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  try {
    const { auth, db } = getAdmin();
    // Create auth user
    const userRecord = await auth.createUser({
      email: body.email,
      password: body.password,
      displayName: `${body.name} ${body.surname}`.trim(),
    });
    // Optionally set custom claims
    await auth.setCustomUserClaims(userRecord.uid, { role: UserRole.Admin });
    // Create/merge Firestore user doc
    await db.collection('users').doc(userRecord.uid).set({
      name: body.name,
      surname: body.surname,
      role: UserRole.Admin,
      email: body.email,
      updatedAt: Date.now(),
    }, { merge: true });
    return NextResponse.json({ id: userRecord.uid, role: UserRole.Admin }, { status: 200 });
  } catch (e: unknown) {
    const message = typeof e === 'object' && e && 'message' in e ? String((e as { message?: unknown }).message) : 'Failed to create admin';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
