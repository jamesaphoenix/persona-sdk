'use client';

import { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  filename?: string;
}

export function CodeBlock({ code, language = 'typescript', showLineNumbers = false, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Use github theme for minimal styling
  const minimalTheme = themes.github;

  return (
    <div className="relative mb-4 group">
      {filename && (
        <div className="text-xs text-[var(--muted)] mb-1 font-mono">
          {filename}
        </div>
      )}
      <div className="relative">
        <Highlight theme={minimalTheme} code={code.trim()} language={language}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre 
              className={className}
              style={style}
            >
              <code>
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line, key: i })}>
                    {showLineNumbers && (
                      <span className="inline-block w-8 text-[var(--muted)] select-none text-right pr-4">
                        {i + 1}
                      </span>
                    )}
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token, key })} />
                    ))}
                  </div>
                ))}
              </code>
            </pre>
          )}
        </Highlight>
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 text-xs px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--fg)] opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Copy code"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}