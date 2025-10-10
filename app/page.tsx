"use client"
import { useEffect, useRef, useState } from "react"

type Repo = { full_name: string; default_branch: string }
type Mode = "oauth" | "token"
type UploadMode = "zip" | "extract"

export default function Page() {
  const [mode, setMode] = useState<Mode | null>(null)
  const [token, setToken] = useState("")
  const [authed, setAuthed] = useState(false)
  const [repos, setRepos] = useState<Repo[]>([])
  const [repo, setRepo] = useState<string>("")
  const [branch, setBranch] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [path, setPath] = useState<string>("")
  const [commit, setCommit] = useState<string>("Upload via Web")
  const [uMode, setUMode] = useState<UploadMode>("extract")
  const [busy, setBusy] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get("ok") === "1") setAuthed(true)
  }, [])

  const startOAuth = () => { window.location.href = "/api/auth/start?provider=github" }

  const useToken = async () => {
    const r = await fetch("/api/auth/start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token: token.trim() }) })
    if (r.ok) setAuthed(true)
  }

  const pickRepo = (r: string, b: string) => { setRepo(r); setBranch(b) }

  const loadRepos = async (p = 1) => {
    const r = await fetch("/api/repos?page=" + p)
    if (!r.ok) return
    const j = await r.json()
    setHasMore(j.hasMore)
    setPage(p)
    if (p === 1) setRepos(j.items)
    else setRepos(prev => [...prev, ...j.items])
  }

  const onUpload = async () => {
    if (!repo || !file) return
    setBusy(true)
    const fd = new FormData()
    fd.append("repo", repo)
    fd.append("branch", branch)
    fd.append("mode", uMode)
    fd.append("targetPath", path)
    fd.append("message", commit)
    fd.append("file", file)
    const r = await fetch("/api/upload", { method: "POST", body: fd })
    setBusy(false)
    if (r.ok) {
      const j = await r.json()
      alert("Done: " + j.summary)
      if (inputRef.current) inputRef.current.value = ""
      setFile(null)
    } else {
      const t = await r.text()
      alert("Error: " + t)
    }
  }

  useEffect(() => { if (authed) loadRepos(1) }, [authed])

  const hero = (
    <section className="hero">
      <div className="inline-flex items-center gap-2 badge"><span>Zip → GitHub</span><span>Vercel</span></div>
      <h1 className="title">Tải ZIP, đẩy thẳng lên <span className="k">GitHub</span></h1>
      <p className="subtitle">Hai cách đăng nhập: Ủy quyền GitHub hoặc nhập Token. Chọn repo, chọn chế độ nén hoặc giải nén rồi up.</p>
      <div className="flex justify-center gap-3 pt-2">
        <button className="btn-primary" onClick={() => setMode("oauth")}>Ủy quyền GitHub</button>
        <button className="btn-ghost" onClick={() => setMode("token")}>Nhập Token</button>
      </div>
    </section>
  )

  const tokenBox = (
    <div className="card p-4 space-y-3">
      <div className="font-semibold">Nhập GitHub Token</div>
      <input className="input" placeholder="ghp_..." value={token} onChange={e => setToken(e.target.value)} />
      <button className="btn-primary" onClick={useToken}>Dùng token</button>
    </div>
  )

  const oauthBox = (
    <div className="card p-4 space-y-3">
      <div className="font-semibold">Ủy quyền với GitHub</div>
      <button className="btn-primary" onClick={startOAuth}>Tiếp tục</button>
    </div>
  )

  const list = (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Chọn repo</div>
        <button className="btn-ghost" onClick={() => loadRepos(1)}>Tải lại</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[320px] overflow-auto">
        {repos.map((r, i) => (
          <button key={i} onClick={() => pickRepo(r.full_name, r.default_branch)} className={"text-left p-3 rounded-xl border " + (repo===r.full_name ? "border-primary bg-violet-50" : "border-slate-200 hover:bg-slate-50") }>
            <div className="font-mono text-sm">{r.full_name}</div>
            <div className="text-xs text-slate-500">branch: {r.default_branch}</div>
          </button>
        ))}
      </div>
      {hasMore && <button className="btn-ghost" onClick={() => loadRepos(page+1)}>Tải thêm</button>}
    </div>
  )

  const uploader = (
    <div className="card p-4 space-y-4">
      <div className="grid-c">
        <div className="space-y-2">
          <div className="font-semibold">Repo</div>
          <div className="input bg-slate-50">{repo || "Chưa chọn"}</div>
        </div>
        <div className="space-y-2">
          <div className="font-semibold">Branch</div>
          <input className="input" value={branch} onChange={e=>setBranch(e.target.value)} />
        </div>
      </div>
      <div className="grid-c">
        <div className="space-y-2">
          <div className="font-semibold">Chế độ</div>
          <div className="flex gap-2">
            <button onClick={()=>setUMode("extract")} className={"btn " + (uMode==="extract"?"bg-primary text-white":"btn-ghost")}>Giải nén & commit</button>
            <button onClick={()=>setUMode("zip")} className={"btn " + (uMode==="zip"?"bg-primary text-white":"btn-ghost")}>Commit file ZIP</button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="font-semibold">Thư mục đích</div>
          <input className="input" placeholder="vd: public/assets" value={path} onChange={e=>setPath(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <div className="font-semibold">Commit message</div>
        <input className="input" value={commit} onChange={e=>setCommit(e.target.value)} />
      </div>
      <div className="space-y-2">
        <div className="font-semibold">Chọn file ZIP</div>
        <input ref={inputRef} className="input" type="file" accept=".zip,application/zip" onChange={e=>setFile(e.target.files?.[0]||null)} />
      </div>
      <div className="flex gap-3">
        <button disabled={!repo || !file || busy} className="btn-primary" onClick={onUpload}>{busy?"Đang xử lý...":"Upload"}</button>
        <button className="btn-ghost" onClick={()=>{setRepo("");setFile(null)}}>Bỏ chọn</button>
      </div>
    </div>
  )

  return (
    <main>
      {hero}
      <section className="section space-y-6">
        {!authed && !mode && <div className="card p-6 text-center space-y-3"><div className="font-semibold">Chọn cách đăng nhập</div><div className="flex justify-center gap-3"><button className="btn-primary" onClick={()=>setMode("oauth")}>Ủy quyền GitHub</button><button className="btn-ghost" onClick={()=>setMode("token")}>Nhập Token</button></div></div>}
        {!authed && mode==="oauth" && oauthBox}
        {!authed && mode==="token" && tokenBox}
        {authed && list}
        {authed && repo && uploader}
      </section>
      <footer className="container-p text-center text-sm text-slate-500">© Zip → GitHub</footer>
    </main>
  )
}
