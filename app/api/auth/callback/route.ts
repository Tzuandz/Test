import { NextResponse } from "next/server"
import { exchangeCodeForToken } from "@/lib/github"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code") || ""
  const base = (req.headers.get("x-forwarded-proto") || "https") + "://" + req.headers.get("host")
  const redirectUri = base + "/api/auth/callback"
  if (!code) return new NextResponse("no code", { status: 400 })
  const token = await exchangeCodeForToken(code, redirectUri)
  if (!token) return new NextResponse("oauth failed", { status: 400 })
  const res = NextResponse.redirect(base + "/?ok=1")
  res.cookies.set("gh_token", token, { httpOnly: true, sameSite: "lax", secure: true, path: "/" })
  return res
}
