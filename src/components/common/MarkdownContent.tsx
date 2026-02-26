'use client';

/**
 * MarkdownContent - Markdownレンダラー
 *
 * react-markdown + remark-gfm で GFM（GitHub Flavored Markdown）を描画。
 * @tailwindcss/typography の prose クラスでスタイリング。
 */

import { memo } from 'react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent = memo(function MarkdownContent({ content }: MarkdownContentProps) {
  if (!content.trim()) return null;

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children, href, ...props }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          ),
          pre: ({ children, ...props }) => (
            <pre
              className="bg-surface-container border-border overflow-x-auto rounded-md border p-3"
              {...props}
            >
              {children}
            </pre>
          ),
          code: ({ children, className, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-surface-container rounded px-1 py-0.5 text-xs" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
