import { NextResponse } from "next/server"
import { requestGithub } from "@/lib/github"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const page = Number(url.searchParams.get("page") || "1")
  const r = await requestGithub(`/user/repos?per_page=100&page=${page}&affiliation=owner,collaborator,organization_member&sort=updated`)
  if (!r.ok) return new NextResponse("auth required", { status: 401 })
  const items = await r.json()
  const mapped = items.map((x: any)=>({ full_name: x.full_name, default_branch: x.default_branch }))
  const hasMore = items.length === 100
  return NextResponse.json({ items: mapped, hasMore })
}
