# Tzuan → GitHub Uploader

- 2 cách đăng nhập: **Ủy quyền GitHub (OAuth)** hoặc **nhập token**.
- Chọn repo, branch, chọn **Up nguyên file .zip** hoặc **Giải nén rồi up**.
- Tự động **ghi đè** nếu trùng (có tuỳ chọn).
- Tiện ích nhanh: **xoá file**, **tạo thư mục**, **tạo/sửa file** ngay trên web.

## Biến môi trường (Vercel)
- `GITHUB_CLIENT_ID` – lấy từ GitHub OAuth App
- `GITHUB_CLIENT_SECRET` – lấy từ GitHub OAuth App
- `NEXT_PUBLIC_SITE_URL` – Ví dụ: `https://tzuan.vercel.app`

## GitHub OAuth App
Authorization callback URL:  
`https://tzuan.vercel.app/api/auth/callback`