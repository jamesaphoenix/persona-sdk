import type { ReactNode } from 'react';
import { DocsLayout } from 'fumadocs-ui/layout';
import { pageTree } from '@/app/source';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout 
      tree={pageTree}
      nav={{ 
        title: 'Persona SDK',
        url: '/'
      }}
      sidebar={{
        defaultOpenLevel: 0
      }}
    >
      {children}
    </DocsLayout>
  );
}