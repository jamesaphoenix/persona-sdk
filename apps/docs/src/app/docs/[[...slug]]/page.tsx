import { notFound } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  
  // For now, just show a simple docs page
  const pageName = slug?.join('/') || 'index';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Persona SDK Documentation</h1>
      <div className="prose max-w-none">
        <p>Welcome to the Persona SDK documentation.</p>
        <p>Current page: {pageName}</p>
        
        <h2>Quick Start</h2>
        <pre className="bg-gray-100 p-4 rounded">
          <code>{`npm install @jamesaphoenix/persona-sdk

import { Persona, PersonaBuilder } from '@jamesaphoenix/persona-sdk';

const persona = PersonaBuilder.create()
  .setName('Alex')
  .setAge(28)
  .setOccupation('Developer')
  .build();

console.log(persona.toObject());`}</code>
        </pre>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return [
    { slug: [] },
    { slug: ['persona'] },
    { slug: ['persona-group'] },
    { slug: ['distributions'] },
    { slug: ['ai'] }
  ];
}