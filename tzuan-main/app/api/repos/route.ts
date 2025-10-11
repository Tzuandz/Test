import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET() {
  const token = cookies().get('gh_token')?.value;
  if (!token) return NextResponse.json({ repos: [] });

  const res = await fetch('https://api.github.com/user/repos?per_page=100', {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'tzuan-uploader'
    },
    next: { revalidate: 0 }
  });
  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: 400 });
  }
  const data = await res.json();
  const repos = data.map((r: any) => ({ full_name: r.full_name, default_branch: r.default_branch }));
  return NextResponse.json({ repos });
}