import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mb-6 mt-8 text-primary">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mb-4 mt-6 text-primary/90">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-medium mb-3 mt-4">{children}</h3>
          ),
          pre: ({ children }) => (
            <Card className="p-4 my-4 bg-muted/50 overflow-x-auto">
              <pre className="text-sm font-mono">{children}</pre>
            </Card>
          ),
          code: ({ children, className }) => {
            // Check if it's inline code or code block
            const isInline = !className;
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">
                  {children}
                </code>
              );
            }
            return <code className={className}>{children}</code>;
          },
          ul: ({ children }) => (
            <ul className="my-4 ml-6 list-disc space-y-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 ml-6 list-decimal space-y-2">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm leading-relaxed">{children}</li>
          ),
          p: ({ children }) => (
            <p className="my-3 leading-relaxed">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-muted-foreground">{children}</em>
          ),
          hr: () => <hr className="my-6 border-border" />,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 my-4 italic">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}