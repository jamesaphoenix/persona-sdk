import type { MDXComponents } from '@mdx-js/react';
import defaultComponents from 'fumadocs-ui/mdx';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...defaultComponents,
    ...components,
  };
}