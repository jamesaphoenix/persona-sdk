import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx';

export const source = loader({
  baseUrl: '/docs',
  source: (createMDXSource as any)({
    files: './content/docs/**/*.mdx',
  }),
});