export const metadata = { title: "Zip → GitHub", description: "Upload ZIP, push to GitHub" }
import "./globals.css"
export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  )
}
