import type { ReactNode } from 'react';

export default function RootDocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">Persona SDK</h1>
        </div>
      </nav>
      <main>
        {children}
      </main>
    </div>
  );
}