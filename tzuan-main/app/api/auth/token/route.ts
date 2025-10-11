import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    const res = NextResponse.json({ ok: true });
    if (token) {
      res.cookies.set('gh_token', token, { httpOnly: true, sameSite: 'lax', secure: true, path: '/' });
    } else {
      res.cookies.set('gh_token', '', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', expires: new Date(0) });
    }
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}