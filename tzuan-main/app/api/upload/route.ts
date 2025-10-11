// app/api/upload/route.ts
import JSZip from "jszip";
import { NextRequest, NextResponse } from "next/server";
import { createOrUpdateFile } from "@/lib/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const repo = String(form.get("repo") || "");
    const branch = String(form.get("branch") || "main");
    const zipOnly = String(form.get("zipOnly") || "false") === "true";
    const overwrite = String(form.get("overwrite") || "true") === "true";
    const message = String(form.get("commitMessage") || "upload via tzuan.vercel.app");
    const file = form.get("file") as File | null;

    if (!repo || !file) {
      return NextResponse.json({ error: "Thiếu repo hoặc file" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());

    // 1) Up nguyên .zip
    if (zipOnly) {
      await createOrUpdateFile({
        repo,
        branch,
        path: file.name || "upload.zip",
        contentB64: buf.toString("base64"),
        message,
        overwrite,
      });
      return NextResponse.json({ ok: true, files: 1 });
    }

    // 2) Giải nén và up từng file
    const zip = await JSZip.loadAsync(buf);
    const entries = Object.values(zip.files);

    // Lấy dữ liệu từng file dưới dạng Uint8Array rồi base64, không double-encode
    const files: { path: string; b64: string }[] = [];
    await Promise.all(
      entries.map(async (ent) => {
        if (ent.dir) return;
        const uint = await ent.async("uint8array");
        files.push({ path: ent.name, b64: Buffer.from(uint).toString("base64") });
      })
    );

    for (const f of files) {
      await createOrUpdateFile({
        repo,
        branch,
        path: f.path,
        contentB64: f.b64,
        message,
        overwrite,
      });
    }

    return NextResponse.json({ ok: true, files: files.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}
