import { NextResponse } from "next/server";
import { ghFetch } from "../_utils";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { repo, branch='main', path, message='mkdir via tzuan.vercel.app' } = await req.json();
  if (!repo || !path) return NextResponse.json({ error: 'Thiếu repo hoặc path' }, { status: 400 });
  const filePath = `${path.replace(/\/+$/,'')}/.gitkeep`;
  const body = {
    message,
    branch,
    content: Buffer.from('', 'utf8').toString('base64')
  };
  const res = await ghFetch(`/repos/${repo}/contents/${encodeURIComponent(filePath)}`, { method: 'PUT', body: JSON.stringify(body) });
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 400 });
  return NextResponse.json({ ok: true });
}