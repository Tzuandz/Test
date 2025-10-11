import { NextResponse } from "next/server";
import { ghFetch, getFileSha } from "../_utils";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { repo, branch='main', path, message='delete via tzuan.vercel.app' } = await req.json();
  if (!repo || !path) return NextResponse.json({ error: 'Thiếu repo hoặc path' }, { status: 400 });
  const sha = await getFileSha(repo, branch, path);
  if (!sha) return NextResponse.json({ error: 'Không tìm thấy file' }, { status: 404 });

  const res = await ghFetch(`/repos/${repo}/contents/${encodeURIComponent(path)}`, {
    method: 'DELETE',
    body: JSON.stringify({ message, branch, sha })
  });
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 400 });
  return NextResponse.json({ ok: true });
}