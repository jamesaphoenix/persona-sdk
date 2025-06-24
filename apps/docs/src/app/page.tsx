import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white fixed w-full top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">🧬 Persona SDK</h1>
          <div className="flex gap-6">
            <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">
              Documentation
            </Link>
            <a href="https://github.com/jamesaphoenix/persona-sdk" className="text-gray-600 hover:text-gray-900 transition-colors">
              GitHub
            </a>
            <a href="https://www.npmjs.com/package/@jamesaphoenix/persona-sdk" className="text-gray-600 hover:text-gray-900 transition-colors">
              npm
            </a>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-6 pt-32 pb-16">
        <div className="text-center mb-20">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              <span>✨</span>
              <span>TypeScript-first persona generation</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
                Generate Realistic Personas
                <br />
                <span className="text-blue-600">with Statistical Distributions</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Create diverse, statistically accurate personas using mathematical distributions, AI-powered insights, and real-world correlations. Perfect for testing, simulations, and user research.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/docs" 
                className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors group"
              >
                Get Started
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <div className="px-8 py-4 bg-gray-100 text-gray-800 rounded-lg font-mono text-sm border border-gray-200">
                npm install @jamesaphoenix/persona-sdk
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-8 bg-gray-50 rounded-xl">
            <div className="text-3xl mb-4">🎲</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Statistical Distributions</h3>
            <p className="text-gray-600">
              Use Normal, Uniform, Exponential, and other distributions to generate realistic attributes.
            </p>
          </div>
          
          <div className="text-center p-8 bg-gray-50 rounded-xl">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">AI-Powered</h3>
            <p className="text-gray-600">
              Create personas from natural language prompts using OpenAI or LangChain integration.
            </p>
          </div>
          
          <div className="text-center p-8 bg-gray-50 rounded-xl">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Group Management</h3>
            <p className="text-gray-600">
              Manage collections of personas with statistical analysis and structured output generation.
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Quick Example</h2>
          <CodeBlock 
            code={`import { 
  PersonaBuilder, 
  PersonaGroup, 
  NormalDistribution,
  CategoricalDistribution 
} from '@jamesaphoenix/persona-sdk';

// Create a single persona
const persona = PersonaBuilder.create()
  .setName('Alex Chen')
  .setAge(28)
  .setOccupation('Product Manager')
  .build();

// Create a group with distributions
const group = new PersonaGroup('Tech Workers');
group.generateFromDistributions(100, {
  age: new NormalDistribution(32, 8),
  occupation: new CategoricalDistribution([
    { value: 'Engineer', probability: 0.6 },
    { value: 'Designer', probability: 0.4 }
  ])
});

// Get statistics
const stats = group.getStatistics('age');
console.log(\`Average age: \${stats.mean.toFixed(1)}\`);`}
            filename="quick-start.ts"
            showLineNumbers
          />
        </div>
      </main>
      
      {/* Call to Action */}
      <section className="bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-gray-300">Build better applications with realistic persona data</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/docs" 
              className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors group"
            >
              View Documentation
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <a 
              href="https://github.com/jamesaphoenix/persona-sdk" 
              className="inline-flex items-center px-8 py-4 border border-gray-600 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors group"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"/>
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </section>
      
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-900">Persona SDK</h3>
              <p className="text-gray-600 text-sm">Generate realistic personas using statistical distributions and AI.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-900">Documentation</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs" className="text-gray-600 hover:text-gray-900">Getting Started</Link></li>
                <li><Link href="/docs/persona" className="text-gray-600 hover:text-gray-900">API Reference</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-900">Community</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="https://github.com/jamesaphoenix/persona-sdk" className="text-gray-600 hover:text-gray-900">GitHub</a></li>
                <li><a href="https://www.npmjs.com/package/@jamesaphoenix/persona-sdk" className="text-gray-600 hover:text-gray-900">npm</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-900">Built with</h3>
              <p className="text-gray-600 text-sm">TypeScript, Next.js, and lots of ☕</p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Persona SDK. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}