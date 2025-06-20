import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx';
import { icons } from 'lucide-react';

export const source = loader({
  baseUrl: '/docs',
  source: createMDXSource({
    files: './content/docs/**/*.mdx',
  }),
  icon(icon) {
    if (icon && icon in icons)
      return icons[icon as keyof typeof icons];
  },
});