import { notFound } from 'next/navigation';
import { getPage, getPages } from '@/app/source';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { getMDXComponents } from '@/mdx-components';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function Page({ params }: PageProps) {
  const { slug = [] } = await params;
  const page = getPage(slug);

  if (!page) {
    notFound();
  }

  // Type assertion to access MDX properties
  const pageData = page.data as any;
  const MDX = pageData.body;

  return (
    <DocsPage toc={pageData.toc} full={pageData.full}>
      <DocsBody>
        <h1 className="text-3xl font-bold">{pageData.title}</h1>
        {MDX && <MDX components={getMDXComponents()} />}
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return getPages().map((page) => ({
    slug: page.slugs,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug = [] } = await params;
  const page = getPage(slug);

  if (!page) notFound();

  const pageData = page.data as any;

  return {
    title: pageData.title || 'Persona SDK Documentation',
    description: pageData.description || 'AI-powered persona generation documentation',
  };
}