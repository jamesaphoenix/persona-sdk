'use client';

import { useState } from 'react';

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

  // Enhanced syntax highlighting with better patterns
  const highlightCode = (code: string) => {
    // First, escape HTML entities
    let highlighted = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Apply syntax highlighting in specific order
    highlighted = highlighted
      // Template literals and strings (handle before comments)
      .replace(/`([^`]*)`/g, '<span class="text-emerald-400">`$1`</span>')
      .replace(/(['"])(?:(?=(\\?))\2.)*?\1/g, '<span class="text-emerald-400">$&</span>')
      // Comments (single and multi-line)
      .replace(/(\/\/.*$)/gm, '<span class="text-gray-500 italic">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500 italic">$1</span>')
      // Import/export statements
      .replace(/\b(import|export)\s+(\{[^}]*\}|\*|\w+)(\s+from)?\s*(['"`][^'"`]+['"`])?/g, 
        (match, keyword, content, from, path) => {
          let result = `<span class="text-purple-400 font-medium">${keyword}</span> ${content}`;
          if (from) result += `<span class="text-purple-400 font-medium">${from}</span>`;
          if (path) result += ` <span class="text-emerald-400">${path}</span>`;
          return result;
        })
      // Keywords (extended list)
      .replace(/\b(const|let|var|function|class|if|else|return|async|await|new|this|try|catch|throw|typeof|instanceof|extends|implements|interface|type|enum|namespace|module|declare|as|public|private|protected|static|readonly|abstract|constructor|get|set|null|undefined|true|false|for|while|do|switch|case|break|continue|default|void|never|any|boolean|number|string|object|symbol|bigint)\b/g, '<span class="text-purple-400 font-medium">$1</span>')
      // Types and interfaces
      .replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, '<span class="text-yellow-400">$1</span>')
      // Functions (before properties)
      .replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="text-blue-400">$1</span>')
      // Numbers (including decimals)
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-orange-400">$1</span>')
      // Object properties and methods
      .replace(/\.([a-zA-Z_]\w*)/g, '.<span class="text-cyan-400">$1</span>')
      // Arrow functions
      .replace(/(\([^)]*\)|[a-zA-Z_]\w*)\s*(=&gt;)/g, '$1 <span class="text-purple-400 font-medium">$2</span>')
      // Operators (be more specific)
      .replace(/(===|!==|==|!=|&lt;=|&gt;=|&lt;|&gt;|\+=|-=|\*=|\/=|&&|\|\||!)/g, '<span class="text-pink-400">$1</span>')
      .replace(/([+\-*/%=?:])/g, '<span class="text-pink-400">$1</span>');

    return highlighted;
  };

  const lines = code.trim().split('\n');

  return (
    <div className="relative group my-6">
      {filename && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 rounded-t-xl border-b border-gray-700 flex items-center justify-between">
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
      <div className={`relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 ${filename ? 'rounded-b-xl' : 'rounded-xl'} overflow-hidden shadow-2xl border border-gray-800`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 via-transparent to-purple-500 opacity-5 pointer-events-none"></div>
        <div className="relative">
          <button
            onClick={copyToClipboard}
            className="absolute top-4 right-4 p-2 rounded-lg bg-gray-800 bg-opacity-80 hover:bg-gray-700 hover:bg-opacity-80 transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-gray-700"
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
          <pre className="overflow-x-auto p-6 text-sm">
            <code className="font-mono">
              {lines.map((line, index) => (
                <div key={index} className="table-row hover:bg-white hover:bg-opacity-5 -mx-6 px-6">
                  {showLineNumbers && (
                    <span className="table-cell pr-6 text-gray-600 select-none text-right w-8">
                      {index + 1}
                    </span>
                  )}
                  <span 
                    className="table-cell px-6"
                    dangerouslySetInnerHTML={{ __html: highlightCode(line) || '&nbsp;' }}
                  />
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
      {copied && (
        <div className="absolute top-4 right-16 bg-gray-800 text-green-400 px-3 py-1 rounded-md text-sm font-medium animate-fade-in">
          Copied!
        </div>
      )}
    </div>
  );
}