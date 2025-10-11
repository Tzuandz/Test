import JSZip from "jszip"
import { cookies } from "next/headers"

type RepoRef = {
  repo: string        // ví dụ: "XUANVNPRO/tzuan"
  branch: string
}

async function getTokenFromCookie(): Promise<string> {
  const c = await cookies()
  const token = c.get("gh_token")?.value || process.env.GITHUB_TOKEN || ""
  if (!token) throw new Error("Thiếu GitHub token. Hãy bấm “Ủy quyền GitHub” hoặc cấu hình PAT.")
  return token
}

export async function requestGithub(path: string, init: RequestInit = {}) {
  const token = await getTokenFromCookie()
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    Authorization: `Bearer ${token}`,
  }

  // Tự JSON.stringify nếu body là object thường
  let body = init.body as any
  const hasBody = body !== undefined
  const isPlainObject =
    hasBody &&
    typeof body === "object" &&
    !(body instanceof ArrayBuffer) &&
    !(body instanceof Uint8Array) &&
    !(body instanceof Blob) &&
    !(body instanceof FormData)

  if (isPlainObject) {
    headers["Content-Type"] = "application/json; charset=utf-8"
    body = JSON.stringify(body)
  }

  const res = await fetch("https://api.github.com" + path, {
    method: init.method,
    headers: { ...headers, ...(init.headers as any) },
    body,
    cache: "no-store",
  })

  const text = await res.text()
  let json: any = null
  try { json = text ? JSON.parse(text) : null } catch { /* ignore */ }

  if (!res.ok) {
    const msg = json?.message || res.statusText || "GitHub API error"
    throw new Error(`${msg} (${res.status})`)
  }
  return json ?? text
}

// Lấy SHA file (nếu tồn tại)
export async function getContentSha(ref: RepoRef, path: string): Promise<string | null> {
  try {
    const r = await requestGithub(
      `/repos/${ref.repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(ref.branch)}`,
      { method: "GET" }
    )
    return r?.sha || null
  } catch (e: any) {
    if (String(e?.message || "").includes("(404)")) return null
    throw e
  }
}

// Tạo/cập nhật 1 file (nội dung base64)
export async function createOrUpdateFile(
  ref: RepoRef & { path: string; message: string; contentBase64: string; overwrite: boolean }
) {
  const sha = await getContentSha(ref, ref.path)
  if (sha && !ref.overwrite) {
    throw new Error("409: File đã tồn tại (bỏ chọn 'Ghi đè nếu trùng' để chặn).")
  }
  const payload: any = { message: ref.message, content: ref.contentBase64, branch: ref.branch }
  if (sha) payload.sha = sha

  return await requestGithub(
    `/repos/${ref.repo}/contents/${encodeURIComponent(ref.path)}`,
    { method: "PUT", body: payload }
  )
}

// Liệt kê toàn bộ file dưới 1 path (đệ quy)
async function listAllFilePaths(ref: RepoRef, basePath: string): Promise<Array<{ path: string; sha: string }>> {
  const out: Array<{ path: string; sha: string }> = []
  async function walk(p: string) {
    try {
      const items = await requestGithub(
        `/repos/${ref.repo}/contents/${encodeURIComponent(p)}?ref=${encodeURIComponent(ref.branch)}`,
        { method: "GET" }
      )
      for (const it of items || []) {
        if (it.type === "dir") await walk(it.path)
        else if (it.type === "file") out.push({ path: it.path, sha: it.sha })
      }
    } catch (e: any) {
      if (!String(e?.message || "").includes("(404)")) throw e
    }
  }
  await walk(basePath)
  return out
}

// Xóa theo danh sách path (tự đệ quy nếu là folder)
export async function deletePaths(ref: RepoRef, targets: string[], message = "delete via tzuan.vercel.app") {
  for (const p of targets) {
    const files = await listAllFilePaths(ref, p)
    if (files.length === 0) {
      const sha = await getContentSha(ref, p)
      if (!sha) continue
      await requestGithub(`/repos/${ref.repo}/contents/${encodeURIComponent(p)}`, {
        method: "DELETE",
        body: { message, branch: ref.branch, sha }
      })
      continue
    }
    for (const f of files) {
      await requestGithub(`/repos/${ref.repo}/contents/${encodeURIComponent(f.path)}`, {
        method: "DELETE",
        body: { message, branch: ref.branch, sha: f.sha }
      })
    }
  }
}

// Xóa sạch repo (mọi file blob trên nhánh)
export async function deleteAll(ref: RepoRef, message = "clean repo via tzuan.vercel.app") {
  const tree = await requestGithub(
    `/repos/${ref.repo}/git/trees/${encodeURIComponent(ref.branch)}?recursive=1`,
    { method: "GET" }
  )
  const fileNodes = (tree?.tree || []).filter((n: any) => n.type === "blob") as Array<{ path: string; sha: string }>
  for (const node of fileNodes) {
    await requestGithub(`/repos/${ref.repo}/contents/${encodeURIComponent(node.path)}`, {
      method: "DELETE",
      body: { message, branch: ref.branch, sha: node.sha }
    })
  }
}

// Giải nén ZIP và up từng file
export async function uploadZipToRepo(
  ref: RepoRef & { blob: Blob; message: string; overwrite: boolean }
) {
  const zip = await JSZip.loadAsync(await ref.blob.arrayBuffer())
  const entries: Array<{ path: string; content: Uint8Array }> = []

  await Promise.all(
    Object.keys(zip.files).map(async (name) => {
      const file = zip.files[name]
      if (file.dir) return
      let path = name.replace(/^(\.\/)+/, "")
      const data = await file.async("uint8array")
      entries.push({ path, content: data })
    })
  )

  // Nếu tất cả file nằm trong 1 folder gốc -> bỏ folder đó
  const top = commonTopFolder(entries.map((e) => e.path))
  const normalized = entries
    .map((e) => ({ ...e, path: top ? e.path.slice(top.length + 1) : e.path }))
    .filter((e) => e.path.length > 0)

  for (const e of normalized) {
    const b64 = Buffer.from(e.content).toString("base64")
    await createOrUpdateFile({
      repo: ref.repo,
      branch: ref.branch,
      path: e.path,
      message: ref.message,
      contentBase64: b64,
      overwrite: ref.overwrite
    })
  }
}

function commonTopFolder(paths: string[]): string | null {
  if (paths.length === 0) return null
  const first = paths[0]
  const idx = first.indexOf("/")
  if (idx === -1) return null
  const top = first.slice(0, idx)
  for (const p of paths) if (!p.startsWith(top + "/")) return null
  return top
}
