'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToolSearchModal } from '@/components/ToolSearchModal';
import { useApp } from '@/components/Providers';
import { ALL_TOOLS, CATEGORIES, PDFTool } from '@/data/tools';
import {
  FileText,
  UploadCloud,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Lock,
  Star,
  Layers,
  CheckCircle2,
  Scissors,
  Files,
  Minimize2,
  RotateCw,
  Trash2,
  ArrowUpDown,
  Image,
  FileImage,
  FileSpreadsheet,
  ImageDown,
  AlignLeft,
  PenTool,
  Stamp,
  FileEdit,
  ScanText,
  Table,
  FileType,
  HelpCircle,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Files,
  Scissors,
  Minimize2,
  RotateCw,
  Trash2,
  ArrowUpDown,
  Image,
  FileImage,
  FileSpreadsheet,
  ImageDown,
  FileText,
  AlignLeft,
  FileType,
  Table,
  Lock,
  Stamp,
  PenTool,
  FileEdit,
  ScanText,
  Sparkles,
};

export default function HomePage() {
  const router = useRouter();
  const { favorites, toggleFavorite, setSearchOpen } = useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [heroDragging, setHeroDragging] = useState(false);

  const filteredTools = useMemo(() => {
    if (activeTab === 'all') return ALL_TOOLS;
    return ALL_TOOLS.filter((t) => t.category === activeTab);
  }, [activeTab]);

  const handleHeroDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setHeroDragging(false);
    // If a PDF is dropped on the hero, redirect to Merge or Split
    router.push('/tools/merge-pdf');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <ToolSearchModal />

      <main className="flex-1">
        {/* HERO SECTION Inspired by reference design */}
        <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white via-slate-50 to-slate-100/60 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950">
          {/* Subtle decorative glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
            {/* Top Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>All Your PDF Tools. One Powerful Workspace.</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4 max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Free Online Tools for{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  PDF, Image & Video
                </span>
              </h1>
              <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Access 45+ professional-grade online tools. 100% free, private, and secure client-side processing.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/tools"
                className="flex items-center gap-2.5 px-8 py-4 text-base font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95"
              >
                <span>Explore Tools</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/tools/merge-pdf"
                className="flex items-center gap-2 px-6 py-4 text-base font-bold rounded-2xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
              >
                <Files className="w-5 h-5 text-blue-600" />
                <span>Merge PDF</span>
              </Link>
            </div>

            {/* Floating feature cards matching reference image layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8 text-left">
              {/* Card 1: 100% Safe */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">100%</h3>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                    Guaranteed Safe &amp; Lightning Fast File Processing
                  </p>
                </div>
              </div>

              {/* Card 2: Center Hero Box */}
              <div className="sm:col-span-2 p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                    Smart Secure Tool Engine
                  </span>
                </div>
                <p className="text-sm sm:text-base font-medium text-blue-50 leading-relaxed mt-4">
                  Experience the future of digital automation with our secure client-side platform that transforms your files instantly while maintaining highest privacy standards.
                </p>
              </div>

              {/* Card 3: $0 Free */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <span className="font-black text-base">$0</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">$0 Free</h3>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                    Always Free for All Users &amp; Devices
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Drag and Drop Target */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setHeroDragging(true);
              }}
              onDragLeave={() => setHeroDragging(false)}
              onDrop={handleHeroDrop}
              onClick={() => router.push('/tools/merge-pdf')}
              className={`max-w-2xl mx-auto p-6 rounded-3xl border-2 border-dashed transition-all cursor-pointer ${
                heroDragging
                  ? 'border-blue-500 bg-blue-100/50 dark:bg-blue-950/50 scale-[1.02]'
                  : 'border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center justify-center gap-3 text-slate-600 dark:text-slate-300">
                <UploadCloud className="w-6 h-6 text-blue-600 animate-bounce" />
                <span className="text-sm font-bold">
                  Drop any PDF here to quickly open in Workspace
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* BROWSE TOOLS CATEGORY CARDS SECTION (Like reference image) */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Our Solutions
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                Browse Tools
              </h2>
            </div>
            <Link
              href="/tools"
              className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 group"
            >
              <span>ALL TOOLS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Yellow - Organize PDF */}
            <Link
              href="/tools?cat=organize"
              className="p-6 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all group flex flex-col justify-between min-h-[190px]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                    <Files className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold bg-white/25 px-2.5 py-0.5 rounded-full">
                    10+ TOOLS
                  </span>
                </div>
                <h3 className="text-xl font-black mt-4">Organize PDF</h3>
                <p className="text-xs text-amber-100 mt-1">Merge, Split, Rotate &amp; Order</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/20 text-xs font-medium">
                <span>Featured: Merge PDF</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 2: Purple - Convert */}
            <Link
              href="/tools?cat=convert"
              className="p-6 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all group flex flex-col justify-between min-h-[190px]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold bg-white/25 px-2.5 py-0.5 rounded-full">
                    10+ TOOLS
                  </span>
                </div>
                <h3 className="text-xl font-black mt-4">Convert PDF</h3>
                <p className="text-xs text-purple-100 mt-1">JPG, PNG, Word, Excel, Text</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/20 text-xs font-medium">
                <span>Featured: JPG to PDF</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 3: Cyan - Security */}
            <Link
              href="/tools?cat=security"
              className="p-6 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all group flex flex-col justify-between min-h-[190px]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold bg-white/25 px-2.5 py-0.5 rounded-full">
                    6+ TOOLS
                  </span>
                </div>
                <h3 className="text-xl font-black mt-4">Security</h3>
                <p className="text-xs text-cyan-100 mt-1">Watermark, Password, Metadata</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/20 text-xs font-medium">
                <span>Featured: Watermark</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 4: Pink / Rose - Edit & Sign */}
            <Link
              href="/tools?cat=edit"
              className="p-6 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/20 hover:scale-[1.02] transition-all group flex flex-col justify-between min-h-[190px]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                    <PenTool className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold bg-white/25 px-2.5 py-0.5 rounded-full">
                    8+ TOOLS
                  </span>
                </div>
                <h3 className="text-xl font-black mt-4">Edit &amp; Sign</h3>
                <p className="text-xs text-rose-100 mt-1">Sign PDF, Draw, Annotate</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/20 text-xs font-medium">
                <span>Featured: Sign PDF</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 5: Red / Violet - Gemini AI */}
            <Link
              href="/tools/ai-pdf-chat"
              className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-500/25 hover:scale-[1.02] transition-all group flex flex-col justify-between min-h-[190px]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold bg-white/25 px-2.5 py-0.5 rounded-full">
                    AI SUITE
                  </span>
                </div>
                <h3 className="text-xl font-black mt-4">Gemini AI</h3>
                <p className="text-xs text-indigo-100 mt-1">Chat, Summarize, Translate</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/20 text-xs font-medium">
                <span>Featured: AI PDF Chat</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* STATS STRIP matching reference design */}
        <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="space-y-1">
              <p className="text-2xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">15K+</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Users</p>
            </div>
            <div className="space-y-1 border-l border-slate-100 dark:border-slate-800">
              <p className="text-2xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">85K+</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Files Converted</p>
            </div>
            <div className="space-y-1 border-l border-slate-100 dark:border-slate-800">
              <p className="text-2xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">45+</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Online Tools</p>
            </div>
            <div className="space-y-1 border-l border-slate-100 dark:border-slate-800">
              <p className="text-2xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">50K+</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">PDFs Created</p>
            </div>
          </div>
        </section>

        {/* POPULAR TOOLS SECTION WITH FILTER TABS */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center space-y-3 mb-8">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Most Used
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Popular Tools
            </h2>
          </div>

          {/* Filter Pills matching reference */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === cat.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md scale-105'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTools.map((tool) => {
              const IconComp = ICON_MAP[tool.iconName] || FileText;
              const isFav = favorites.includes(tool.id);

              return (
                <div
                  key={tool.id}
                  className="group relative flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 ${tool.bgColor}`}
                      >
                        <IconComp className="w-6 h-6" />
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(tool.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-amber-400 dark:text-slate-600 dark:hover:text-amber-400 transition-colors"
                        title={isFav ? 'Favorited' : 'Add to favorites'}
                      >
                        <Star
                          className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`}
                        />
                      </button>
                    </div>

                    <Link href={tool.href} className="block">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        <span>{tool.name}</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </Link>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                      {tool.categoryLabel}
                    </span>
                    <Link
                      href={tool.href}
                      className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <span>VIEW ALL 45+ TOOLS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* WHY ZORAPDF / PRIVACY FIRST SECTION */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
          <div className="text-center space-y-3 mb-12">
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Privacy First Architecture
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Why Professionals Choose ZoraPDF
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Zero Cloud Uploads for Core Tools
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Unlike traditional PDF converters that store files on distant servers, ZoraPDF processes your PDFs directly in your browser using client-side WebAssembly.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Near-Instant Processing Speed
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Without network upload lags or server queue wait times, your files are merged, converted, and protected with native computing performance.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Gemini 3 AI Intelligence
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Optionally analyze complex reports, generate executive summaries, ask factual questions, and translate multi-lingual PDFs with Google Gemini.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-200 dark:border-slate-800">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-500">
              Everything you need to know about ZoraPDF platform and privacy.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Are my uploaded files stored on your servers?</span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 pl-6 leading-relaxed">
                No. All core PDF operations (merging, splitting, rotating, deleting, watermarking, signing) run 100% locally in your web browser. Your confidential documents never leave your machine.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>How does the Gemini AI PDF feature work?</span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 pl-6 leading-relaxed">
                When you choose AI Chat, text chunks are extracted in your browser and sent securely via our server-side API proxy to Google Gemini 3 models for answering questions and summarizing without exposing API keys.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Is Google Sign-in required to use the tools?</span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 pl-6 leading-relaxed">
                No. You can use all PDF tools as a guest. Signing in with Google allows you to persist your favorites and processing history securely in Firestore.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
