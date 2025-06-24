'use client';

import { useState } from 'react';
import Link from 'next/link';

interface MobileNavigationProps {
  navigation: Array<{ name: string; href: string }>;
  currentPath: string;
}

export function MobileNavigation({ navigation, currentPath }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--fg)]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar */}
      <aside 
        className={`lg:hidden fixed inset-0 z-40 w-64 bg-[var(--bg)] border-r border-[var(--border)] py-8 px-6 overflow-y-auto transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="font-semibold text-lg">
            Persona SDK
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 text-[var(--muted)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = item.href === currentPath;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`block py-2 text-sm ${
                  isActive 
                    ? 'text-[var(--accent)] font-medium' 
                    : 'text-[var(--muted)] hover:text-[var(--fg)]'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-8 pt-8 border-t border-[var(--border)]">
          <div className="space-y-3">
            <a href="https://github.com/jamesaphoenix/persona-sdk" className="text-sm flex items-center gap-2 text-[var(--muted)] hover:text-[var(--fg)]">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"/>
              </svg>
              GitHub
            </a>
            <a href="https://www.npmjs.com/package/@jamesaphoenix/persona-sdk" className="text-sm flex items-center gap-2 text-[var(--muted)] hover:text-[var(--fg)]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331z"/>
              </svg>
              npm
            </a>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}