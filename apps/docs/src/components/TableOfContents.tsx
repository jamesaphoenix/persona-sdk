'use client';

import { useEffect, useState, useRef } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Wait a bit for content to be fully rendered
    const timer = setTimeout(() => {
      const content = document.getElementById('main-content');
      if (!content) return;

      const headings = content.querySelectorAll('h2, h3, h4');
      const items: TocItem[] = [];

      headings.forEach((heading) => {
        const id = heading.textContent
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || '';
        
        // Only set ID if it doesn't already exist
        if (!heading.id) {
          heading.id = id;
        }
        
        items.push({
          id: heading.id || id,
          text: heading.textContent || '',
          level: parseInt(heading.tagName.charAt(1))
        });
      });

      setTocItems(items);

      // Clean up previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Create new Intersection Observer for active section highlighting
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        {
          rootMargin: '-100px 0px -66%',
          threshold: 0
        }
      );

      headings.forEach((heading) => {
        if (observerRef.current) {
          observerRef.current.observe(heading);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  if (tocItems.length === 0) {
    return (
      <div className="text-xs text-[var(--muted)]">
        Loading table of contents...
      </div>
    );
  }

  return (
    <nav className="space-y-2">
      {tocItems.map((item) => {
        const indent = item.level === 2 ? '' : item.level === 3 ? 'ml-4' : 'ml-8';
        const isActive = activeId === item.id;
        
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`block py-1 text-xs ${indent} transition-colors ${
              isActive 
                ? 'text-[var(--accent)]' 
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById(item.id);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            {item.text}
          </a>
        );
      })}
    </nav>
  );
}