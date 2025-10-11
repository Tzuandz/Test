// /app/api/manage/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function ghHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
}

function parseRepo(repo: string) {
  const [owner, name] = repo.split("/");
  if (!owner || !name) throw new Error("Repo không hợp lệ. Dạng: owner/repo");
  return { owner, name };
}

async function getToken(req: NextRequest) {
  const cookie = req.cookies.get("gh_token")?.value || process.env.GH_TOKEN;
  if (!cookie) throw new Error("Thiếu GitHub token. Hãy ủy quyền hoặc đặt GH_TOKEN.");
  return cookie;
}

type GHItem = {
  type: "file" | "dir";
  path: string;
  sha: string;
};

async function list(owner: string, name: string, path: string, branch: string, token: string) {
  const url =
    path === ""
      ? `https://api.github.com/repos/${owner}/${name}/contents?ref=${encodeURIComponent(branch)}`
      : `https://api.github.com/repos/${owner}/${name}/contents/${encodeURIComponent(
          path
        )}?ref=${encodeURIComponent(branch)}`;

  const r = await fetch(url, { headers: ghHeaders(token) });
  if (r.status === 404) return [] as GHItem[];
  if (!r.ok) throw new Error(await r.text());
  const data = await r.json();
  if (Array.isArray(data)) return data as GHItem[];
  return [data as GHItem];
}

async function listRecursive(
  owner: string,
  name: string,
  path: string,
  branch: string,
  token: string
): Promise<GHItem[]> {
  const items = await list(owner, name, path, branch, token);
  const out: GHItem[] = [];
  for (const it of items) {
    if (it.type === "file") out.push(it);
    else if (it.type === "dir") out.push(...(await listRecursive(owner, name, it.path, branch, token)));
  }
  return out;
}

async function deleteFile(
  owner: string,
  name: string,
  filePath: string,
  sha: string,
  branch: string,
  message: string,
  token: string
) {
  const url = `https://api.github.com/repos/${owner}/${name}/contents/${encodeURIComponent(filePath)}`;
  const r = await fetch(url, {
    method: "DELETE",
    headers: ghHeaders(token),
    body: JSON.stringify({ message, sha, branch }),
  });
  if (!r.ok) throw new Error(await r.text());
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken(req);
    const body = await req.json();
    const { repo, branch = "main", action, path = "", message = "cleanup via tzuan.vercel.app" } = body || {};
    if (!repo) throw new Error("Thiếu repo");
    const { owner, name } = parseRepo(repo);

    if (action === "delete") {
      // Xoá file hoặc thư mục (đệ quy)
      const files = await listRecursive(owner, name, path, branch, token);
      for (const f of files) {
        await deleteFile(owner, name, f.path, f.sha, branch, message, token);
      }
      return NextResponse.json({ ok: true, deleted: files.length });
    }

    if (action === "deleteAll") {
      // Xoá mọi thứ trong repo (trừ khi repo rỗng)
      const files = await listRecursive(owner, name, "", branch, token);
      for (const f of files) {
        await deleteFile(owner, name, f.path, f.sha, branch, message, token);
      }
      return NextResponse.json({ ok: true, deleted: files.length });
    }

    return NextResponse.json({ error: "action không hợp lệ" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}
