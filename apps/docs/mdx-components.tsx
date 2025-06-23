import defaultComponents from 'fumadocs-ui/mdx';

type MDXComponents = any;

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...defaultComponents,
    ...components,
  };
}