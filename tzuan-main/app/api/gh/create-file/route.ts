import { NextResponse } from "next/server";
import { ghFetch, getFileSha } from "../_utils";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { repo, branch='main', path, content='', message='edit via tzuan.vercel.app', overwrite=false } = await req.json();
  if (!repo || !path) return NextResponse.json({ error: 'Thiếu repo hoặc path' }, { status: 400 });

  const sha = await getFileSha(repo, branch, path);
  if (sha && !overwrite) {
    return NextResponse.json({ error: 'File đã tồn tại' }, { status: 409 });
  }
  const body = {
    message,
    branch,
    content: Buffer.from(content, 'utf8').toString('base64'),
    ...(sha ? { sha } : {})
  };
  const res = await ghFetch(`/repos/${repo}/contents/${encodeURIComponent(path)}`, { method: 'PUT', body: JSON.stringify(body) });
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 400 });
  const data = await res.json();
  return NextResponse.json({ ok: true, data });
}