import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.redirect((process.env.NEXT_PUBLIC_SITE_URL || '/') as string);

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'tzuan-uploader'
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    })
  });

  const data = await res.json();
  const token = data.access_token as string | undefined;
  const site = process.env.NEXT_PUBLIC_SITE_URL || '/';

  const resp = NextResponse.redirect(site as string);
  if (token) {
    resp.cookies.set('gh_token', token, { httpOnly: true, sameSite: 'lax', secure: true, path: '/' });
  }
  return resp;
}