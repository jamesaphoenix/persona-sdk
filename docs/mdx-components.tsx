import type { MDXComponents } from 'mdx/types';
import { Callout } from 'fumadocs-ui/components/callout';

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...components,
    Note: (props: any) => <Callout type="info" {...props} />,
    Warning: (props: any) => <Callout type="warn" {...props} />,
    Tip: (props: any) => <Callout type="info" {...props} />,
    Caution: (props: any) => <Callout type="error" {...props} />,
  };
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return useMDXComponents(components);
}