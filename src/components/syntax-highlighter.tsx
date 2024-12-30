'use client';

import { getHighlighter } from 'shiki';

interface CodePreviewProps {
  code: string;
  language?: string;
  className?: string;
}

export async function CodePreview({ code, language = 'csharp', className = '' }: CodePreviewProps) {
  if (!code) return null;

  const highlighter = await getHighlighter({
    theme: 'one-dark-pro'
  });

  const html = highlighter.codeToHtml(code, { lang: language });

  return (
    <div 
      className={`rounded-md mt-2 text-sm ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
