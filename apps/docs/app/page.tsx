export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Persona SDK Documentation</h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Installation</h2>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            <code>npm install @jamesaphoenix/persona-sdk</code>
          </pre>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Quick Start</h2>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            <code>{`import { PersonaBuilder } from '@jamesaphoenix/persona-sdk';

const persona = PersonaBuilder.create()
  .setName('Alice Johnson')
  .setAge(28)
  .setOccupation('Software Engineer')
  .setSex('female')
  .build();

console.log(persona.name); // "Alice Johnson"`}</code>
          </pre>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>🤖 AI-Powered persona generation from natural language prompts</li>
            <li>📊 Statistical distributions for realistic data</li>
            <li>⚡ Structured output generation with Zod validation</li>
            <li>🧪 Comprehensive runtime testing with cassettes</li>
            <li>📦 Minimal footprint - only 68KB</li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Core Components</h2>
          <ul className="space-y-4">
            <li>
              <strong>Persona</strong> - Individual persona instances with attributes
            </li>
            <li>
              <strong>PersonaBuilder</strong> - Fluent builder for creating personas
            </li>
            <li>
              <strong>PersonaGroup</strong> - Manage collections of personas
            </li>
            <li>
              <strong>Distributions</strong> - Normal, Uniform, Exponential, Beta, Categorical
            </li>
            <li>
              <strong>AI Features</strong> - OpenAI integration for intelligent generation
            </li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Links</h2>
          <ul className="space-y-2">
            <li>
              <a href="https://github.com/jamesaphoenix/persona-sdk" className="text-blue-600 hover:underline">
                GitHub Repository
              </a>
            </li>
            <li>
              <a href="https://www.npmjs.com/package/@jamesaphoenix/persona-sdk" className="text-blue-600 hover:underline">
                NPM Package
              </a>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}