'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToolSearchModal } from '@/components/ToolSearchModal';
import { useApp } from '@/components/Providers';
import { fetchUserHistory, ToolHistoryRecord } from '@/lib/firebase';
import { formatBytes } from '@/lib/pdf-service';
import {
  History,
  Clock,
  ArrowRight,
  ShieldCheck,
  Trash2,
  FileText,
  CheckCircle2,
  LogIn,
} from 'lucide-react';

export default function HistoryPage() {
  const { user, signIn } = useApp();
  const [historyItems, setHistoryItems] = useState<ToolHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const items = await fetchUserHistory();
        setHistoryItems(items);
      } catch (e) {
        console.warn('Could not load history:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleClearHistory = () => {
    setHistoryItems([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <ToolSearchModal />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
              <History className="w-3.5 h-3.5" />
              <span>Activity Log</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              Processing History
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Review your recent document processing operations.
            </p>
          </div>

          {historyItems.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors self-start"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Guest Banner */}
        {!user && (
          <div className="mb-8 p-5 rounded-3xl bg-blue-50/70 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Sync Your History Across Devices
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Sign in with Google to securely persist your history in cloud Firestore.
                </p>
              </div>
            </div>
            <button
              onClick={signIn}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-1.5 shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In with Google</span>
            </button>
          </div>
        )}

        {/* History Table or Empty State */}
        {loading ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Clock className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
            <p className="text-sm text-slate-500">Loading history records...</p>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <History className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No recent activity yet
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Operations you perform across PDF tools will be logged here for quick reference.
              </p>
            </div>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-md"
            >
              <span>Explore Tools</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {historyItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                        {item.toolName}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-bold">
                        Success
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.fileName}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.fileSize ? formatBytes(item.fileSize) : ''}
                      {item.resultSize ? ` → ${formatBytes(item.resultSize)}` : ''}
                      {item.pageCount ? ` • ${item.pageCount} pages` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </span>
                  </div>

                  <Link
                    href={`/tools/${item.toolId}`}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
