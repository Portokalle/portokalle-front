import { NextRequest, NextResponse } from 'next/server';
import { getAdmin } from '../../_lib/admin';
import { UserRole, toUserRole } from '@/domain/entities/UserRole';

export async function POST(req: NextRequest) {
  const role = toUserRole(req.cookies.get('userRole')?.value);
  if (role !== UserRole.Admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as { appointmentIds?: string[] } | null;
  const appointmentIds = Array.isArray(body?.appointmentIds) ? body!.appointmentIds : [];
  if (!appointmentIds.length) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    const { db } = getAdmin();
    const batch = db.batch();
    appointmentIds.forEach((id) => {
      const ref = db.collection('appointments').doc(id);
      batch.update(ref, { dismissedByAdmin: true });
    });
    await batch.commit();
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to dismiss appointments';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
