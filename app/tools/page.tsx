'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToolSearchModal } from '@/components/ToolSearchModal';
import { useApp } from '@/components/Providers';
import { ALL_TOOLS, CATEGORIES, PDFTool } from '@/data/tools';
import {
  Search,
  Star,
  ArrowRight,
  Sparkles,
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
  Filter,
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

function ToolsCatalogContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('cat') || 'all';

  const { favorites, toggleFavorite } = useApp();
  const [selectedCat, setSelectedCat] = useState(initialCat);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter((tool) => {
      if (favoritesOnly && !favorites.includes(tool.id)) {
        return false;
      }
      if (selectedCat !== 'all' && tool.category !== selectedCat) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inName = tool.name.toLowerCase().includes(q);
        const inDesc = tool.description.toLowerCase().includes(q);
        const inKeywords = tool.keywords.some((k) => k.toLowerCase().includes(q));
        if (!inName && !inDesc && !inKeywords) return false;
      }
      return true;
    });
  }, [selectedCat, searchQuery, favoritesOnly, favorites]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <ToolSearchModal />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <span>45+ Online PDF &amp; Document Tools</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            All PDF &amp; Document Tools
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl">
            Choose from our comprehensive suite of high-performance tools. Everything runs securely and fast in your browser.
          </p>
        </div>

        {/* Controls: Search bar & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tool name or keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all shrink-0 ${
                favoritesOnly
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-white' : ''}`} />
              <span>Favorites ({favorites.length})</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedCat === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        {filteredTools.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
              No matching tools found
            </p>
            <p className="text-xs text-slate-400">
              Try adjusting your search query or switching categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCat('all');
                setFavoritesOnly(false);
              }}
              className="mt-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
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
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ToolsCatalogPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading tools...</div>}>
      <ToolsCatalogContent />
    </Suspense>
  );
}
