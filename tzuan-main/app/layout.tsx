import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tzuan → GitHub Uploader",
  description: "Upload ZIPs / files, unzip & push straight to GitHub. OAuth or token.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <header className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Zip → <span className="text-violet-400">GitHub</span> (tzuan)</h1>
            <nav className="flex items-center gap-3">
              <a className="link" href="https://tzuan.pages.dev" target="_blank" rel="noreferrer">Info</a>
              <a className="link" href="https://github.com/XUANVNPRO" target="_blank" rel="noreferrer">GitHub</a>
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4">{children}</main>
        <footer>
          © <span className="text-violet-400">Tzuan.vercel.app</span> → GitHub
        </footer>
      </body>
    </html>
  );
}