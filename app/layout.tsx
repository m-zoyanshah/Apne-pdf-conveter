import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'ZoraPDF — All-in-One PDF Tools | by Zoyan',
  description:
    'All Your PDF Tools. One Powerful Workspace. Merge, split, compress, convert, edit, OCR, watermark, protect, and AI chat with your PDFs directly in your browser.',
  openGraph: {
    title: 'ZoraPDF — All-in-One PDF Tools',
    description:
      'All Your PDF Tools. One Powerful Workspace. Merge, split, compress, convert, edit, OCR, watermark, protect, and AI chat with your PDFs.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZoraPDF — All-in-One PDF Tools',
    description:
      'All Your PDF Tools. One Powerful Workspace. Merge, split, compress, convert, edit, OCR, watermark, protect, and AI chat with your PDFs.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
