import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm fixed w-full top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">🧬 Persona SDK</h1>
          <div className="flex gap-6">
            <Link href="/docs" className="text-gray-700 hover:text-blue-600 transition-colors">
              Documentation
            </Link>
            <a href="https://github.com/jamesaphoenix/persona-sdk" className="text-gray-700 hover:text-blue-600 transition-colors">
              GitHub
            </a>
            <a href="https://www.npmjs.com/package/@jamesaphoenix/persona-sdk" className="text-gray-700 hover:text-blue-600 transition-colors">
              npm
            </a>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-6 pt-32 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Persona SDK
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Generate realistic personas using statistical distributions and AI. 
            Perfect for testing, simulations, and data generation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/docs"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started →
            </Link>
            <div className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-mono rounded-lg">
              npm install @jamesaphoenix/persona-sdk
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-4">🎲</div>
            <h3 className="text-xl font-semibold mb-3">Statistical Distributions</h3>
            <p className="text-gray-600">
              Use Normal, Uniform, Exponential, and other distributions to generate realistic attributes.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-3">AI-Powered</h3>
            <p className="text-gray-600">
              Create personas from natural language prompts using OpenAI or LangChain integration.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-3">Group Management</h3>
            <p className="text-gray-600">
              Manage collections of personas with statistical analysis and structured output generation.
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6">Quick Example</h2>
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
      
      <footer className="bg-gray-900 text-white mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Persona SDK</h3>
              <p className="text-gray-400 text-sm">Generate realistic personas using statistical distributions and AI.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Documentation</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs" className="text-gray-400 hover:text-white">Getting Started</Link></li>
                <li><Link href="/docs/persona" className="text-gray-400 hover:text-white">API Reference</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Community</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="https://github.com/jamesaphoenix/persona-sdk" className="text-gray-400 hover:text-white">GitHub</a></li>
                <li><a href="https://www.npmjs.com/package/@jamesaphoenix/persona-sdk" className="text-gray-400 hover:text-white">npm</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Built with</h3>
              <p className="text-gray-400 text-sm">TypeScript, Next.js, and lots of ☕</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Persona SDK. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}