import createMDX from 'fumadocs-mdx/config';
import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';

const withMDX = createMDX({
  mdxOptions: {
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/persona-sdk' : '',
  images: {
    unoptimized: true,
  },
};

export default withMDX(nextConfig);