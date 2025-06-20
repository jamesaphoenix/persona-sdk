import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Persona SDK Documentation</h1>
      
      <h2>Installation</h2>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
        npm install @jamesaphoenix/persona-sdk
      </pre>

      <h2>Quick Start</h2>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
{`import { PersonaBuilder } from '@jamesaphoenix/persona-sdk';

const persona = PersonaBuilder.create()
  .setName('Alex')
  .setAge(28)
  .setOccupation('Developer')
  .setSex('other')
  .build();

console.log(persona.name); // "Alex"`}
      </pre>

      <h2>API Reference</h2>
      <ul>
        <li><Link href="/docs/persona">Persona Class</Link></li>
        <li><Link href="/docs/persona-builder">PersonaBuilder</Link></li>
        <li><Link href="/docs/persona-group">PersonaGroup</Link></li>
        <li><Link href="/docs/distributions">Distributions</Link></li>
        <li><Link href="/docs/ai">AI Features</Link></li>
      </ul>

      <h2>Features</h2>
      <ul>
        <li>🤖 AI-powered persona generation</li>
        <li>📊 Statistical distributions</li>
        <li>⚡ Structured output generation</li>
        <li>🧪 Runtime testing with cassettes</li>
        <li>📦 Minimal footprint (68KB)</li>
      </ul>
    </div>
  );
}