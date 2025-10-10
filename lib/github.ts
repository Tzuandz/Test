import { cookies } from "next/headers"

export async function getTokenFromCookie() {
  const c = await cookies()
  const t = c.get("gh_token")?.value || ""
  return t
}

export async function requestGithub(path, init = {}) {
  const token = await getTokenFromCookie()
  const r = await fetch("https://api.github.com" + path, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json"
    },
    cache: "no-store"
  })
  return r
}

export async function exchangeCodeForToken(code, redirectUri) {
  const r = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "content-type": "application/json", "accept": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri
    })
  })
  const j = await r.json()
  return j.access_token || ""
}
