import { cookies } from "next/headers";

export async function ghFetch(path: string, init?: RequestInit) {
  const token = cookies().get('gh_token')?.value;
  if (!token) throw new Error('Chưa đăng nhập GitHub');
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'tzuan-uploader',
      ...(init?.headers || {})
    }
  });
  return res;
}

export async function getFileSha(ownerRepo: string, branch: string, path: string) {
  const res = await ghFetch(`/repos/${ownerRepo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  if (Array.isArray(data)) return null;
  return data.sha as string;
}