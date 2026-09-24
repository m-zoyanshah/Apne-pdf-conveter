'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tool-system/ToolLayout';
import { FileUploader } from '@/components/tool-system/FileUploader';
import { ProgressBar } from '@/components/tool-system/ProgressBar';
import { ErrorMessage } from '@/components/tool-system/ErrorMessage';
import { extractFullTextWithPdfJs } from '@/lib/pdfjs-renderer';
import { extractTextFromPdf } from '@/lib/pdf-service';
import { recordToolUsage } from '@/lib/firebase';
import {
  Sparkles,
  Send,
  Bot,
  User,
  FileText,
  Copy,
  Check,
  RotateCcw,
  ListOrdered,
  Languages,
  BookOpen,
  Key,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function AiPdfChatPage() {
  const [file, setFile] = useState<File | null>(null);
  const [documentText, setDocumentText] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setIsExtracting(true);

    try {
      let text = '';
      let pages = 1;

      const pdfJsRes = await extractFullTextWithPdfJs(selected);
      if (pdfJsRes.text && pdfJsRes.text.trim().length > 20) {
        text = pdfJsRes.text;
        pages = pdfJsRes.pages.length;
      } else {
        const basic = await extractTextFromPdf(selected);
        text = basic.fullText;
        pages = basic.pageCount;
      }

      setDocumentText(text);
      setPageCount(pages);

      // Initial assistant greeting
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hello! I've loaded **"${selected.name}"** (${pages} pages). You can ask me questions about this document, request an executive summary, extract key takeaways, or translate sections.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      try {
        await recordToolUsage({
          toolId: 'ai-pdf-chat',
          toolName: 'AI PDF Chat',
          fileName: selected.name,
          fileSize: selected.size,
          pageCount: pages,
          status: 'success',
        });
      } catch (e) {
        console.warn('History record failed:', e);
      }
    } catch (err: any) {
      console.error('Text extraction error:', err);
      setError('Could not extract text from document for AI analysis.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSendMessage = async (customPrompt?: string, actionType?: string) => {
    const promptToSend = customPrompt || inputQuestion;
    if (!promptToSend.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsThinking(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType || 'chat',
          documentText: documentText.slice(0, 50000), // Limit payload for prompt window
          question: promptToSend,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to communicate with AI model.');
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.result || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI chat error:', err);
      setError(err?.message || 'AI request failed. Please check your connection.');
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ Error: ${err?.message || 'Could not process request.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <ToolLayout
      toolId="ai-pdf-chat"
      title="AI PDF Chat & Summary"
      description="Chat with your documents using Google Gemini. Ask factual questions, generate executive summaries, pull key points, or translate text instantly."
      badge="Gemini AI"
      categoryLabel="Gemini AI Suite"
      isAi={true}
      howToSteps={[
        { title: 'Upload Document', desc: 'Select any PDF report, book, whitepaper, or article.' },
        { title: 'Ask Questions or Summarize', desc: 'Choose quick prompt presets or ask specific contextual questions.' },
        { title: 'Get Instant Answers', desc: 'Receive grounded, factual insights directly synthesized from your document.' },
      ]}
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {!file ? (
          <FileUploader
            onFilesSelected={handleFileSelected}
            title="Drop a PDF file here to chat with Gemini AI"
            subtitle="Analyze reports, papers, contracts, or books"
          />
        ) : isExtracting ? (
          <ProgressBar progress={50} statusText="Reading and parsing PDF document text..." />
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Header Strip */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-sm">
                    {file.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {pageCount} Page(s) • Powered by Gemini 3 Flash
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  setMessages([]);
                  setDocumentText('');
                }}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Upload New PDF</span>
              </button>
            </div>

            {/* Quick Action Presets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => handleSendMessage('Please provide a comprehensive executive summary of this document.', 'summary')}
                disabled={isThinking}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-500 shadow-2xs whitespace-nowrap transition-all"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Summarize PDF</span>
              </button>

              <button
                onClick={() => handleSendMessage('Extract the key highlights, takeaways, and bullet points from this document.', 'key_points')}
                disabled={isThinking}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-500 shadow-2xs whitespace-nowrap transition-all"
              >
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>Key Points</span>
              </button>

              <button
                onClick={() => handleSendMessage('Generate a detailed structural outline of this document with sections.', 'outline')}
                disabled={isThinking}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-500 shadow-2xs whitespace-nowrap transition-all"
              >
                <ListOrdered className="w-3.5 h-3.5 text-emerald-500" />
                <span>Document Outline</span>
              </button>

              <button
                onClick={() => handleSendMessage('Please translate the main message of this document into Spanish.', 'translate')}
                disabled={isThinking}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-500 shadow-2xs whitespace-nowrap transition-all"
              >
                <Languages className="w-3.5 h-3.5 text-blue-500" />
                <span>Translate to Spanish</span>
              </button>
            </div>

            {/* Chat Messages Box */}
            <div className="h-[480px] p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner overflow-y-auto space-y-4 flex flex-col">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-indigo-600 text-white shadow-md'
                    }`}
                  >
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed relative group ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/10 dark:border-white/10 text-[10px] opacity-70">
                      <span>{msg.timestamp}</span>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex gap-3 max-w-[85%] self-start animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
                    <span>Gemini is reading and reasoning...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Ask anything about this document..."
                disabled={isThinking}
                className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!inputQuestion.trim() || isThinking}
                className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-40 transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
