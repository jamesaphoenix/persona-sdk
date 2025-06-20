import { DocsLayout } from 'fumadocs-ui/layout';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';

export default function RootDocsLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={source.pageTree} nav={{ title: 'Persona SDK' }}>
      {children}
    </DocsLayout>
  );
}