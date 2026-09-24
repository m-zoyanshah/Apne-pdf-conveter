'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tool-system/ToolLayout';
import { FileUploader } from '@/components/tool-system/FileUploader';
import { ProgressBar } from '@/components/tool-system/ProgressBar';
import { ResultCard } from '@/components/tool-system/ResultCard';
import { ErrorMessage } from '@/components/tool-system/ErrorMessage';
import { extractFullTextWithPdfJs } from '@/lib/pdfjs-renderer';
import { recordToolUsage } from '@/lib/firebase';
import { FileType, Download, CheckCircle2 } from 'lucide-react';

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [wordDocContent, setWordDocContent] = useState<string | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files[0]) {
      setFile(files[0]);
      setError(null);
      setWordDocContent(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(25);
    setError(null);

    try {
      setProgress(60);
      const res = await extractFullTextWithPdfJs(file);

      // Generate HTML-based Word document with proper XML schema namespaces
      const pagesHtml = res.pages
        .map(
          (p) => `
          <div style="page-break-after: always; margin-bottom: 40px; font-family: Calibri, sans-serif; line-height: 1.6;">
            <p style="color: #666; font-size: 10pt; border-bottom: 1px solid #ccc; padding-bottom: 4px;">Page ${p.pageNumber}</p>
            <div style="font-size: 11pt; color: #111;">
              ${p.text
                .split('\n\n')
                .map((para) => `<p style="margin-bottom: 12px;">${para.replace(/\n/g, '<br/>')}</p>`)
                .join('')}
            </div>
          </div>
        `
        )
        .join('');

      const docContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>${file.name}</title>
          <!--[if gte mso 9]>
          <xml>
          <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
          </xml>
          <![endif]-->
        </head>
        <body style="font-family: Calibri, sans-serif; padding: 40px;">
          ${pagesHtml}
        </body>
        </html>
      `;

      setProgress(100);
      setWordDocContent(docContent);

      try {
        await recordToolUsage({
          toolId: 'pdf-to-word',
          toolName: 'PDF to Word',
          fileName: file.name,
          fileSize: file.size,
          resultSize: docContent.length,
          pageCount: res.pages.length,
          status: 'success',
        });
      } catch (e) {
        console.warn('History record failed:', e);
      }
    } catch (err: any) {
      console.error('PDF to Word error:', err);
      setError(err?.message || 'Failed to convert PDF to Word format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (wordDocContent && file) {
      const blob = new Blob(['\ufeff', wordDocContent], {
        type: 'application/msword;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace(/\.pdf$/i, '')}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
  };

  return (
    <ToolLayout
      toolId="pdf-to-word"
      title="PDF to Word Converter"
      description="Convert PDF documents into editable Microsoft Word (.doc) files. Preserves paragraphs, formatting, and page structure."
      badge="Doc Converter"
      categoryLabel="Convert PDF"
    >
      <div className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {wordDocContent && file ? (
          <ResultCard
            fileName={`${file.name.replace(/\.pdf$/i, '')}.doc`}
            fileSize={wordDocContent.length}
            originalSize={file.size}
            onDownload={handleDownload}
            onReset={() => {
              setWordDocContent(null);
              setFile(null);
            }}
            title="PDF Converted to Word Document!"
            subtitle="Ready to open and edit in Microsoft Word, Google Docs, or LibreOffice."
          />
        ) : isProcessing ? (
          <ProgressBar progress={progress} statusText="Formatting text structures for Microsoft Word..." />
        ) : (
          <div className="space-y-6">
            {!file ? (
              <FileUploader
                onFilesSelected={handleFileSelected}
                title="Drop a PDF file here to convert to Word"
                subtitle="Select 1 PDF file to convert to editable format"
              />
            ) : (
              <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-200 dark:border-blue-800">
                  <FileType className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {file.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Ready for Word conversion</p>
                </div>

                <button
                  onClick={handleConvert}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/25 transition-all"
                >
                  <FileType className="w-5 h-5" />
                  <span>Convert to Microsoft Word</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
