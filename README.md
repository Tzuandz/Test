# Zip → GitHub (Vercel, JSZip build)

- Login: OAuth GitHub **hoặc** nhập token
- Liệt kê repo, chọn branch
- Upload ZIP, chọn:
  - **Giải nén & commit** (dùng JSZip)
  - **Commit nguyên file ZIP**

## Deploy
1. Import repo vào Vercel → Deploy.
2. Dùng Token trước (không cần ENV). Muốn OAuth: tạo OAuth App và set `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` vào Vercel.
