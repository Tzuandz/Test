"use client";

import { useEffect, useState, useRef } from "react";

type Repo = { full_name: string; default_branch: string };

// Lưu/Pull token vào localStorage + cookie cho server đọc
function useToken() {
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    setTokenState(localStorage.getItem("gh_token"));
  }, []);

  const setToken = (t: string | null) => {
    if (t) localStorage.setItem("gh_token", t);
    else localStorage.removeItem("gh_token");
    setTokenState(t);
    fetch("/api/auth/token", {
      method: "POST",
      body: JSON.stringify({ token: t }),
    }).catch(() => {});
  };

  return { token, setToken };
}

export default function Home() {
  const { token, setToken } = useToken();

  // ====== State chính (giữ nguyên deco cũ) ======
  const [mode, setMode] = useState<"oauth" | "token">("oauth");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [branch, setBranch] = useState<string>("main");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [asZip, setAsZip] = useState(false);
  const [overwrite, setOverwrite] = useState(true);
  const [commitMsg, setCommitMsg] = useState("upload via tzuan.vercel.app");

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0); // 🔥 thanh tiến độ (%)

  // Tiện ích nhanh (GIỮ nguyên + thêm nút mới)
  const [path, setPath] = useState("");
  const [newFilePath, setNewFilePath] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ====== Load repos khi có token ======
  useEffect(() => {
    (async () => {
      const r = await fetch("/api/repos").catch(() => null);
      if (!r?.ok) return;
      const data = await r.json();
      setRepos(data.repos || []);
    })();
  }, [token]);

  // Chọn repo mặc định
  useEffect(() => {
    if (!selectedRepo && repos.length) {
      setSelectedRepo(repos[0].full_name);
      setBranch(repos[0].default_branch || "main");
    }
  }, [repos, selectedRepo]);

  const handleAuthorize = () => {
    window.location.href = "/api/auth/login";
  };

  // ====== Upload có thanh tiến độ (XHR) ======
  const handleUpload = async () => {
    if (!selectedRepo) return alert("Hãy chọn repo");
    if (!zipFile) return alert("Hãy chọn file ZIP");

    setUploading(true);
    setProgress(0);

    try {
      const fd = new FormData();
      fd.append("repo", selectedRepo);
      fd.append("branch", branch || "main");
      fd.append("asZip", String(asZip));
      fd.append("overwrite", String(overwrite));
      fd.append("message", commitMsg || "upload via tzuan.vercel.app");
      fd.append("file", zipFile);

      // Dùng XHR để lấy onprogress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");
        xhr.responseType = "json";

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          const data = xhr.response || {};
          if (xhr.status >= 200 && xhr.status < 300) {
            alert(
              `✅ Upload OK (${data.files ?? data.count ?? 0} file) → ${selectedRepo}@${branch}`
            );
            resolve();
          } else {
            reject(new Error(data?.error || `HTTP ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Failed to fetch (mạng/giới hạn payload?)"));

        xhr.send(fd);
      });

      // reset input file cho sạch
      setZipFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      alert(`Error: ${err?.message || err}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // ====== Helper gọi API JSON (tiện ích cũ) ======
  const api = async (url: string, payload: any) => {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || r.statusText);
    return j;
  };

  // ====== API tiện ích mới (xóa thư mục / xóa tất cả) ======
  const callFs = async (action: "deletePath" | "deleteAll", extra: any = {}) => {
    const r = await fetch("/api/fs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        repo: selectedRepo,
        branch,
        message: commitMsg || "tzuan.vercel.app",
        ...extra,
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || r.statusText);
    return j;
  };

  const handleDeleteFolder = async () => {
    if (!selectedRepo || !path) return alert("Chọn repo và nhập đường dẫn thư mục");
    if (!confirm(`Xóa thư mục "${path}"?`)) return;
    try {
      await callFs("deletePath", { path });
      alert("✅ Đã xóa thư mục");
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    }
  };

  const handleDeleteAll = async () => {
    if (!selectedRepo) return alert("Chưa chọn repo");
    if (!confirm(`⚠ XÓA TẤT CẢ nội dung của ${selectedRepo}@${branch}?`)) return;
    try {
      await callFs("deleteAll");
      alert("✅ Đã xóa tất cả");
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      {/* ===== Khối ủy quyền / nhập token (GIỮ nguyên deco) ===== */}
      <div className="card space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("oauth")}
            className={`btn ${mode === "oauth" ? "bg-violet-600" : "bg-neutral-800"}`}
          >
            Ủy quyền GitHub
          </button>
          <button
            onClick={() => setMode("token")}
            className={`btn ${mode === "token" ? "bg-violet-600" : "bg-neutral-800"}`}
          >
            Nhập Token
          </button>
          <a className="btn bg-neutral-800" href="https://tzuan.pages.dev" target="_blank" rel="noreferrer">
            Info
          </a>
        </div>

        {mode === "oauth" && (
          <div className="space-y-2">
            <p className="label">
              Đăng nhập bằng OAuth (khuyến nghị). Nếu thấy 404, kiểm tra callback URL trong OAuth App.
            </p>
            <button onClick={handleAuthorize} className="btn">
              Ủy quyền GitHub
            </button>
          </div>
        )}

        {mode === "token" && (
          <div className="space-y-2">
            <label className="label">Personal Access Token (scope: repo)</label>
            <div className="flex gap-2">
              <input
                className="input"
                defaultValue={token ?? ""}
                placeholder="ghp_xxx..."
                onChange={(e) => setToken(e.target.value)}
              />
              <button className="btn bg-neutral-800" onClick={() => setToken(null)}>
                Xóa
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== Khối upload ZIP ===== */}
      <div className="card space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Chọn repo</label>
            <select
              className="select"
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
            >
              {repos.map((r) => (
                <option key={r.full_name} value={r.full_name}>
                  {r.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Branch</label>
            <input
              className="input"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Chọn file ZIP</label>
            <input
              ref={fileInputRef}
              className="input"
              type="file"
              accept=".zip"
              onChange={(e) => setZipFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="space-y-2">
            <label className="label">Commit message</label>
            <input
              className="input"
              value={commitMsg}
              onChange={(e) => setCommitMsg(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={asZip}
                  onChange={(e) => setAsZip(e.target.checked)}
                />
                Up nguyên file .zip
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={overwrite}
                  onChange={(e) => setOverwrite(e.target.checked)}
                />
                Ghi đè nếu trùng
              </label>
            </div>
          </div>
        </div>

        <button onClick={handleUpload} className="btn" disabled={uploading || !zipFile}>
          {uploading ? "Đang xử lý..." : "Tải lên"}
        </button>

        {/* 🔥 Thanh tiến độ */}
        {uploading && (
          <div className="w-full bg-neutral-800 rounded h-2 overflow-hidden">
            <div
              className="h-2 bg-violet-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* ===== Tiện ích nhanh (GIỮ nguyên + thêm 2 nút mới) ===== */}
      <div className="card space-y-3">
        <h2 className="text-lg font-semibold">Tiện ích nhanh</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {/* CỘT TRÁI: xoá/tạo thư mục (CŨ) + 2 NÚT MỚI */}
          <div className="space-y-2">
            <label className="label">Đường dẫn (path) để xoá hoặc tạo</label>
            <input
              className="input"
              placeholder="folder/file.txt hoặc folder mới"
              value={path}
              onChange={(e) => setPath(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {/* Nút XÓA cũ (file) */}
              <button
                className="btn bg-red-600 hover:bg-red-500"
                onClick={async () => {
                  if (!selectedRepo || !path) return alert("Chọn repo và nhập path");
                  try {
                    await api("/api/gh/delete", {
                      repo: selectedRepo,
                      branch,
                      path,
                      message: commitMsg || "delete via tzuan.vercel.app",
                    });
                    alert("Đã xoá");
                  } catch (e: any) {
                    alert("Lỗi: " + e.message);
                  }
                }}
              >
                Xoá (file)
              </button>

              {/* Nút TẠO THƯ MỤC cũ */}
              <button
                className="btn"
                onClick={async () => {
                  if (!selectedRepo || !path) return alert("Chọn repo và nhập path");
                  try {
                    await api("/api/gh/create-folder", {
                      repo: selectedRepo,
                      branch,
                      path,
                      message: commitMsg || "mkdir via tzuan.vercel.app",
                    });
                    alert("Đã tạo thư mục");
                  } catch (e: any) {
                    alert("Lỗi: " + e.message);
                  }
                }}
              >
                Tạo thư mục
              </button>

              {/* ➕ Nút mới: XÓA THƯ MỤC (đệ quy) */}
              <button className="btn bg-orange-600 hover:bg-orange-500" onClick={handleDeleteFolder}>
                Xóa thư mục
              </button>

              {/* ➕ Nút mới: XÓA TẤT CẢ */}
              <button className="btn bg-red-700 hover:bg-red-600" onClick={handleDeleteAll}>
                Xóa tất cả
              </button>
            </div>
          </div>

          {/* CỘT PHẢI: tạo/sửa file nhanh (CŨ – giữ nguyên) */}
          <div className="space-y-2">
            <label className="label">Tạo/Sửa file nhanh</label>
            <input
              className="input"
              placeholder="ví dụ: README.md"
              value={newFilePath}
              onChange={(e) => setNewFilePath(e.target.value)}
            />
            <textarea
              className="input h-32"
              placeholder="Nội dung…"
              value={newFileContent}
              onChange={(e) => setNewFileContent(e.target.value)}
            />
            <button
              className="btn"
              onClick={async () => {
                if (!selectedRepo || !newFilePath) return alert("Chọn repo và nhập file path");
                try {
                  await api("/api/gh/create-file", {
                    repo: selectedRepo,
                    branch,
                    path: newFilePath,
                    content: newFileContent,
                    message: commitMsg || "edit via tzuan.vercel.app",
                    overwrite: true,
                  });
                  alert("Đã tạo/sửa file");
                } catch (e: any) {
                  alert("Lỗi: " + e.message);
                }
              }}
            >
              Lưu file
            </button>
          </div>
        </div>
      </div>

      <footer className="text-center text-neutral-500 text-sm">
        © <span className="text-violet-400">Tzuan.vercel.app</span> → GitHub
      </footer>
    </div>
  );
}
