import React from 'react';
import Link from 'next/link';
import { FileText, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
                <FileText className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Zora<span className="text-blue-600 dark:text-blue-400">PDF</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              All Your PDF Tools. One Powerful Workspace. Brand: <span className="font-semibold text-slate-700 dark:text-slate-200">Zoyan</span>.
              Fast, privacy-first, and client-side processing directly in your browser.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Storage Guarantee for Local Operations</span>
            </div>
          </div>

          {/* Col 1: PDF Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Organize
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/tools/merge-pdf" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/split-pdf" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Split PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/compress-pdf" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Compress PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/rotate-pdf" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Rotate PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/delete-pdf-pages" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Delete Pages
                </Link>
              </li>
              <li>
                <Link href="/tools/reorder-pdf" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Reorder Pages
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Convert & Edit */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Convert & Edit
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/tools/jpg-to-pdf" className="hover:text-blue-600 dark:hover:text-blue-400">
                  JPG to PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/png-to-pdf" className="hover:text-blue-600 dark:hover:text-blue-400">
                  PNG to PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf-to-jpg" className="hover:text-blue-600 dark:hover:text-blue-400">
                  PDF to JPG
                </Link>
              </li>
              <li>
                <Link href="/tools/sign-pdf" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Sign PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf-editor" className="hover:text-blue-600 dark:hover:text-blue-400">
                  PDF Editor
                </Link>
              </li>
              <li>
                <Link href="/tools/watermark-pdf" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Watermark PDF
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: AI & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              AI & Company
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link
                  href="/tools/ai-pdf-chat"
                  className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini AI Chat</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400">
                  About ZoraPDF
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-blue-600 dark:hover:text-blue-400">
                  FAQ & Guides
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} ZoraPDF. Built by Zoyan. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Powered by WebAssembly & Google Gemini</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for developers & creators
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
