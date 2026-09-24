'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from './Providers';
import {
  FileText,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Layers,
  Lock,
  PenTool,
  History,
  Star,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, signIn, signOut, isDark, toggleTheme, setSearchOpen, favorites } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const pdfToolsList = [
    { name: 'Merge PDF', href: '/tools/merge-pdf', desc: 'Combine multiple PDFs into one' },
    { name: 'Split PDF', href: '/tools/split-pdf', desc: 'Extract pages or split ranges' },
    { name: 'Compress PDF', href: '/tools/compress-pdf', desc: 'Reduce PDF file size' },
    { name: 'Rotate PDF', href: '/tools/rotate-pdf', desc: 'Rotate portrait / landscape' },
    { name: 'Delete Pages', href: '/tools/delete-pdf-pages', desc: 'Remove unwanted pages' },
    { name: 'Reorder Pages', href: '/tools/reorder-pdf', desc: 'Rearrange page sequences' },
  ];

  const convertToolsList = [
    { name: 'JPG to PDF', href: '/tools/jpg-to-pdf', desc: 'Convert JPG images to PDF' },
    { name: 'PNG to PDF', href: '/tools/png-to-pdf', desc: 'Convert PNG graphics to PDF' },
    { name: 'PDF to JPG', href: '/tools/pdf-to-jpg', desc: 'Export pages as JPG images' },
    { name: 'PDF to PNG', href: '/tools/pdf-to-png', desc: 'High quality PNG extraction' },
    { name: 'PDF to Text', href: '/tools/pdf-to-text', desc: 'Extract editable text' },
    { name: 'Text to PDF', href: '/tools/text-to-pdf', desc: 'Generate PDF from plain text' },
  ];

  const securityToolsList = [
    { name: 'Protect PDF', href: '/tools/protect-pdf', desc: 'Password security & flags' },
    { name: 'Add Watermark', href: '/tools/watermark-pdf', desc: 'Stamp text watermarks' },
    { name: 'Sign PDF', href: '/tools/sign-pdf', desc: 'Draw or type signature' },
    { name: 'PDF Editor', href: '/tools/pdf-editor', desc: 'Annotate, draw and markup' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo matching reference */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                    Zora<span className="text-blue-600 dark:text-blue-400">PDF</span>
                  </span>
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    by Zoyan
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                pathname === '/'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              Home
            </Link>

            <Link
              href="/tools"
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                pathname === '/tools'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              All Tools (45+)
            </Link>

            {/* Dropdown 1: PDF Tools */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('pdf')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60">
                <span>PDF Tools</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
              {activeDropdown === 'pdf' && (
                <div className="absolute left-0 mt-1 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                  {pdfToolsList.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="flex flex-col px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {tool.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {tool.desc}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Dropdown 2: Convert */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('convert')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60">
                <span>Convert</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
              {activeDropdown === 'convert' && (
                <div className="absolute left-0 mt-1 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                  {convertToolsList.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="flex flex-col px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {tool.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {tool.desc}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Dropdown 3: Edit & Security */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('security')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60">
                <span>Security & Edit</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
              {activeDropdown === 'security' && (
                <div className="absolute left-0 mt-1 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                  {securityToolsList.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="flex flex-col px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {tool.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {tool.desc}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* AI Assistant Link */}
            <Link
              href="/tools/ai-pdf-chat"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 text-indigo-600 dark:text-indigo-400 hover:from-purple-500/20 hover:to-blue-500/20 transition-all border border-indigo-200/50 dark:border-indigo-800/50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini AI</span>
              <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                NEW
              </span>
            </Link>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Global Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
              title="Search tools (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Search tools...</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-600 text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Favorites & History Links */}
            <Link
              href="/history"
              className="hidden sm:flex items-center gap-1 p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="History & Saved Files"
            >
              <History className="w-4 h-4" />
            </Link>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Google Sign-in / User Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-700 transition-all"
                >
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[90px] truncate hidden md:inline">
                    {user.displayName?.split(' ')[0] || 'Account'}
                  </span>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Avatar'}
                      className="w-7 h-7 rounded-full object-cover border border-blue-500/50"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      {user.displayName?.[0] || 'U'}
                    </div>
                  )}
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Connected to Firestore</span>
                      </div>
                    </div>

                    <div className="py-2 space-y-1">
                      <Link
                        href="/history"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <History className="w-4 h-4 text-blue-500" />
                        <span>Processing History</span>
                      </Link>
                      <Link
                        href="/tools"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <Star className="w-4 h-4 text-amber-500" />
                        <span>My Favorite Tools ({favorites.length})</span>
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          signOut();
                          setUserDropdownOpen(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={signIn}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
                </svg>
                <span>Sign in</span>
              </button>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-2 px-1">
              <Link
                href="/tools"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                <Layers className="w-4 h-4 text-blue-500" />
                <span>All 45+ Tools</span>
              </Link>
              <Link
                href="/tools/ai-pdf-chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-sm font-medium text-indigo-700 dark:text-indigo-300"
              >
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>AI PDF Chat</span>
              </Link>
            </div>

            <div className="pt-2 px-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Popular Tools
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-sm">
                <Link
                  href="/tools/merge-pdf"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Merge PDF
                </Link>
                <Link
                  href="/tools/split-pdf"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Split PDF
                </Link>
                <Link
                  href="/tools/compress-pdf"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Compress PDF
                </Link>
                <Link
                  href="/tools/sign-pdf"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Sign PDF
                </Link>
                <Link
                  href="/tools/jpg-to-pdf"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  JPG to PDF
                </Link>
                <Link
                  href="/tools/pdf-editor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  PDF Editor
                </Link>
              </div>
            </div>

            <div className="pt-2 px-1 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
              <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                About
              </Link>
              <Link href="/privacy" onClick={() => setMobileMenuOpen(false)}>
                Privacy
              </Link>
              <Link href="/terms" onClick={() => setMobileMenuOpen(false)}>
                Terms
              </Link>
              <Link href="/faq" onClick={() => setMobileMenuOpen(false)}>
                FAQ
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
