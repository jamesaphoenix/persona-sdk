import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx';
import { docs as docsSource } from '@/.source';

export const source = loader({
  baseUrl: '/docs',
  source: createMDXSource(docsSource as any, []),
});

export const { getPage, getPages, pageTree } = source;