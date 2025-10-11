import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID!;
  const site = process.env.NEXT_PUBLIC_SITE_URL!;
  const redirectUri = `${site}/api/auth/callback`;
  const scope = 'repo';
  const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  return NextResponse.redirect(url);
}