import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const provider = searchParams.get("provider")
  if (provider !== "github") return new NextResponse("unsupported", { status: 400 })
  const base = (req.headers.get("x-forwarded-proto") || "https") + "://" + req.headers.get("host")
  const redirectUri = base + "/api/auth/callback"
  const url = new URL("https://github.com/login/oauth/authorize")
  url.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID || "")
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("scope", "repo")
  url.searchParams.set("allow_signup", "true")
  return NextResponse.redirect(url.toString())
}

export async function POST(req: Request) {
  const body = await req.json()
  const token = String(body.token || "").trim()
  if (!token) return new NextResponse("missing token", { status: 400 })
  const res = NextResponse.json({ ok: true })
  res.cookies.set("gh_token", token, { httpOnly: true, sameSite: "lax", secure: true, path: "/" })
  return res
}
