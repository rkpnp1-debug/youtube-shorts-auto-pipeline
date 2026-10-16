import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'YouTube Shorts Auto Pipeline',
  description: 'Upload videos → AI agents optimize → daily auto-upload to Shorts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen">
        <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight">
            Shorts<span className="text-red-500">Auto</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="/" className="hover:text-white text-zinc-400">Dashboard</a>
            <a href="/upload" className="hover:text-white text-zinc-400">Upload</a>
            <a href="/queue" className="hover:text-white text-zinc-400">Queue</a>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
