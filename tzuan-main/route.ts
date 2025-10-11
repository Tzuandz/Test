// app/api/fs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { deleteAll, deletePathDeep, createOrUpdateFile } from "@/lib/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { action, repo, branch = "main", path, message = "tzuan.vercel.app" } =
      await req.json();

    if (!repo || !action) {
      return NextResponse.json({ error: "Thiếu repo/action" }, { status: 400 });
    }

    if (action === "deletePath") {
      if (!path) return NextResponse.json({ error: "Thiếu path" }, { status: 400 });
      await deletePathDeep(repo, branch, path, message);
      return NextResponse.json({ ok: true });
    }

    if (action === "deleteAll") {
      await deleteAll(repo, branch, message);
      return NextResponse.json({ ok: true });
    }

    if (action === "mkdir") {
      if (!path) return NextResponse.json({ error: "Thiếu path" }, { status: 400 });
      // GitHub không có "mkdir", ta tạo 1 file .gitkeep để đảm bảo folder tồn tại
      await createOrUpdateFile({
        repo,
        branch,
        path: path.replace(/\/+$/, "") + "/.gitkeep",
        contentB64: Buffer.from("").toString("base64"),
        message,
        overwrite: true,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Action không hỗ trợ" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}