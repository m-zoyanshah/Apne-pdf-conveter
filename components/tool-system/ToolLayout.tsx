'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToolSearchModal } from '@/components/ToolSearchModal';
import { ToolHeader } from './ToolHeader';
import { ALL_TOOLS } from '@/data/tools';
import { CheckCircle2, HelpCircle, ArrowRight, ShieldCheck, Zap, Lock } from 'lucide-react';

interface ToolLayoutProps {
  toolId: string;
  title: string;
  description: string;
  badge?: string;
  categoryLabel?: string;
  isAi?: boolean;
  children: React.ReactNode;
  howToSteps?: { title: string; desc: string }[];
  faqs?: { q: string; a: string }[];
}

export function ToolLayout({
  toolId,
  title,
  description,
  badge,
  categoryLabel,
  isAi = false,
  children,
  howToSteps = [
    { title: 'Upload Your File', desc: 'Select or drag-and-drop your PDF or images from your computer or phone.' },
    { title: 'Customize Settings', desc: 'Preview pages, configure options, order, or custom parameters in real time.' },
    { title: 'Download Instantly', desc: 'Generate your processed document locally in milliseconds with guaranteed zero server retention.' },
  ],
  faqs = [
    {
      q: 'Is it safe to use ZoraPDF with confidential documents?',
      a: 'Yes, 100%. All core PDF operations (merging, splitting, rotating, deleting, watermarking, signing) run entirely client-side in your web browser using WebAssembly. Your files are never uploaded to any external server.',
    },
    {
      q: 'Are there any hidden costs or page limits?',
      a: 'ZoraPDF is completely free to use. There are no watermarks added without your consent and no hidden subscriptions.',
    },
    {
      q: 'Does ZoraPDF work on mobile devices?',
      a: 'Yes. The entire platform is fully responsive and optimized for iPhones, Android smartphones, tablets, and desktop workstations.',
    },
  ],
}: ToolLayoutProps) {
  // Related tools from same or popular category
  const relatedTools = ALL_TOOLS.filter((t) => t.id !== toolId).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <ToolSearchModal />

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Tool Header */}
          <ToolHeader
            toolId={toolId}
            title={title}
            description={description}
            badge={badge}
            categoryLabel={categoryLabel}
            isAi={isAi}
          />

          {/* Interactive Workspace Area */}
          <div className="my-8">{children}</div>

          {/* How It Works Section */}
          <div className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white text-center mb-8">
              How to {title} in 3 Simple Steps
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {howToSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-all"
                >
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-black text-lg flex items-center justify-center mb-4 border border-blue-200/50 dark:border-blue-800/50">
                    {idx + 1}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Trust Banner */}
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-200/50 dark:border-blue-800/50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Zero Upload Privacy Architecture
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Your PDF is processed strictly in your device memory. No cloud upload, no tracking, guaranteed.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-4 h-4" />
              <span>TLS / Local In-Memory</span>
            </div>
          </div>

          {/* FAQ Accordion Section */}
          <div className="mt-16">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white text-center mb-8">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4 max-w-3xl mx-auto">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{faq.q}</span>
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Related Tools */}
          <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              More Powerful PDF Tools
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 shadow-sm transition-all hover:-translate-y-0.5 group"
                >
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block mb-1">
                    {tool.categoryLabel}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {tool.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {tool.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
