import { docs, meta } from '../../source.config';

export const source = {
  baseUrl: '/docs',
  getPage: (slug?: string[]) => {
    const path = slug ? slug.join('/') : '';
    return docs.find((doc: any) => doc.slugs.join('/') === path) || null;
  },
  getPages: () => docs,
  generateParams: () => docs.map((doc: any) => ({ slug: doc.slugs })),
};