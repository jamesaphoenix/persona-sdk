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

  // Map common language aliases to Prism language identifiers
  const getLanguage = (lang: string) => {
    const langMap: Record<string, string> = {
      'typescript': 'typescript',
      'ts': 'typescript', 
      'javascript': 'javascript',
      'js': 'javascript',
      'bash': 'bash',
      'shell': 'bash',
      'sh': 'bash',
      'json': 'json',
      'jsx': 'jsx',
      'tsx': 'tsx'
    };
    return langMap[lang.toLowerCase()] || 'typescript';
  };

  return (
    <div className="relative group my-6">
      {filename && (
        <div className="bg-gray-800 px-4 py-2 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm text-gray-400 font-mono ml-2">{filename}</span>
          </div>
          <span className="text-xs text-gray-500">{language}</span>
        </div>
      )}
      <div className={`relative ${filename ? 'rounded-b-xl' : 'rounded-xl'} overflow-hidden shadow-lg border border-gray-800`}>
        <button
          onClick={copyToClipboard}
          className="absolute top-4 right-4 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100 z-10"
          aria-label="Copy code"
        >
          {copied ? (
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
        
        <Highlight theme={themes.oneDark} code={code.trim()} language={getLanguage(language) as any}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre 
              className={`${className} overflow-x-auto p-6 text-sm`} 
              style={{ ...style, background: 'rgb(17 24 39)' }}
            >
              {tokens.map((line, i) => (
                <div 
                  key={i} 
                  {...getLineProps({ line })}
                  className="table-row hover:bg-white hover:bg-opacity-5"
                >
                  {showLineNumbers && (
                    <span className="table-cell pr-4 text-gray-600 select-none text-right w-12">
                      {i + 1}
                    </span>
                  )}
                  <span className="table-cell">
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
      {copied && (
        <div className="absolute top-4 right-16 bg-gray-800 text-green-400 px-3 py-1 rounded-md text-sm font-medium animate-fade-in">
          Copied!
        </div>
      )}
    </div>
  );
}