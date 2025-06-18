'use client';

import { useMDXComponent } from 'fumadocs-mdx/client';

export function MDXContent({ code }: { code: string }) {
  const Component = useMDXComponent(code);
  return <Component />;
}