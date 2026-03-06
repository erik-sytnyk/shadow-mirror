import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shadow Mirror",
  description: "Shadow Mirror — AI-интерфейс глубины. Ты не тот, кем себя считаешь. shadow-mirror.dev",
};

const DEPLOY_VERSION =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body className={`${geistMono.variable} antialiased bg-black text-zinc-200`}>
        {children}
        {process.env.VERCEL_GIT_COMMIT_SHA ? (
          <a
            href={`https://github.com/erik-sytnyk/shadow-mirror/commit/${process.env.VERCEL_GIT_COMMIT_SHA}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-2 right-2 text-[10px] text-zinc-600 hover:text-zinc-500 font-mono transition-colors"
            title="Deploy version"
          >
            {DEPLOY_VERSION}
          </a>
        ) : (
          <span
            className="fixed bottom-2 right-2 text-[10px] text-zinc-600 font-mono"
            title="Local development"
          >
            {DEPLOY_VERSION}
          </span>
        )}
      </body>
    </html>
  );
}
