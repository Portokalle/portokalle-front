import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }
    // TODO: Verify idToken and set session cookie if needed
    // For now, just return success for frontend integration
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
