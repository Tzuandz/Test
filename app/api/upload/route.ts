import { NextResponse } from "next/server"
import { requestGithub } from "@/lib/github"
import JSZip from "jszip"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

async function getDefaultBranch(owner: string, repo: string) {
  const r = await requestGithub(`/repos/${owner}/${repo}`)
  const j = await r.json()
  return j.default_branch || "main"
}

async function upsertFile(owner: string, repo: string, branch: string, path: string, contentBase64: string, message: string) {
  const get = await requestGithub(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}`)
  const sha = get.ok ? (await get.json()).sha : undefined
  const body: any = { message, content: contentBase64, branch }
  if (sha) body.sha = sha
  const put = await requestGithub(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  })
  if (!put.ok) throw new Error(await put.text())
}

export async function POST(req: Request) {
  const form = await req.formData()
  const repoFull = String(form.get("repo") || "")
  const branchIn = String(form.get("branch") || "")
  const mode = String(form.get("mode") || "extract")
  const targetPath = String(form.get("targetPath") || "")
  const message = String(form.get("message") || "Upload via Web")
  const file: File | null = form.get("file") as any
  if (!repoFull || !file) return new NextResponse("missing fields", { status: 400 })
  const [owner, repo] = repoFull.split("/")
  const arr = Buffer.from(await file.arrayBuffer())
  const branch = branchIn || await getDefaultBranch(owner, repo)

  if (mode === "zip") {
    const filename = (file.name || "upload.zip")
    const path = (targetPath ? targetPath.replace(/^\/+|\/+$/g,"") + "/" : "") + filename
    await upsertFile(owner, repo, branch, path, arr.toString("base64"), message)
    return NextResponse.json({ summary: `Committed ZIP to ${repoFull}@${branch}/${path}` })
  }

  const zip = await JSZip.loadAsync(arr)
  const entries: {rel:string, f:JSZip.JSZipObject}[] = []
  zip.forEach((rel, f) => { if (!f.dir) entries.push({ rel, f }) })

  let count = 0
  const limit = 4
  const queue = entries.slice()
  async function worker() {
    while (queue.length) {
      const { rel, f } = queue.shift()!
      const raw = await f.async("nodebuffer")
      const p = (targetPath ? targetPath.replace(/^\/+|\/+$/g,"") + "/" : "") + rel.replace(/^\/+/, "")
      await upsertFile(owner, repo, branch, p, Buffer.from(raw).toString("base64"), message)
      count++
    }
  }
  await Promise.all(Array.from({length:limit}, worker))
  return NextResponse.json({ summary: `Committed ${count} files to ${repoFull}@${branch}${targetPath?"/"+targetPath:""}` })
}
