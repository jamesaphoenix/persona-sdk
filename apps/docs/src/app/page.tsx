import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      <nav className="relative z-20 border-b border-white/20 bg-white/10 backdrop-blur-sm fixed w-full top-0">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">🧬 Persona SDK</h1>
          <div className="flex gap-6">
            <Link href="/docs" className="text-gray-700 hover:text-blue-600 transition-colors font-semibold">
              Documentation
            </Link>
            <a href="https://github.com/jamesaphoenix/persona-sdk" className="text-gray-700 hover:text-blue-600 transition-colors font-semibold">
              GitHub
            </a>
            <a href="https://www.npmjs.com/package/@jamesaphoenix/persona-sdk" className="text-gray-700 hover:text-blue-600 transition-colors font-semibold">
              npm
            </a>
          </div>
        </div>
      </nav>
      
      <main className="relative z-10 container mx-auto px-6 pt-32 pb-16">
        <div className="text-center mb-20">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm border border-blue-200 text-blue-700 rounded-full text-sm font-semibold shadow-lg">
              <span className="text-lg">✨</span>
              <span>TypeScript-first • AI-powered • Production-ready</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-none">
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Generate
                </span>
                <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                  Realistic
                </span>
                <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Personas
                </span>
              </h1>
              
              <p className="text-2xl text-gray-700 max-w-4xl mx-auto font-medium leading-relaxed">
                The most advanced persona generation library. Create <span className="font-bold text-blue-600">statistically accurate</span>, <span className="font-bold text-purple-600">AI-enhanced</span> personas with real-world correlations in milliseconds.
              </p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6 justify-center items-center">
              <Link href="/docs" className="group px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1">
                Start Building Now
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
              <div className="px-12 py-5 bg-white/90 backdrop-blur-sm border-2 border-gray-300 text-gray-800 rounded-2xl font-bold text-lg shadow-xl font-mono">
                npm install @jamesaphoenix/persona-sdk
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
              <div className="text-3xl font-black text-blue-600 mb-2">1000+</div>
              <div className="text-gray-700 font-semibold">Personas per second</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
              <div className="text-3xl font-black text-purple-600 mb-2">15+</div>
              <div className="text-gray-700 font-semibold">Statistical distributions</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
              <div className="text-3xl font-black text-emerald-600 mb-2">100%</div>
              <div className="text-gray-700 font-semibold">TypeScript coverage</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-16">
          <div className="text-center space-y-6">
            <h2 className="text-5xl font-black bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent">Powerful Features</h2>
            <p className="text-2xl text-gray-600 font-medium">Everything you need to build incredible experiences</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 p-8 rounded-3xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-3xl"></div>
              <div className="relative text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🎲</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900">Statistical Distributions</h3>
                <p className="text-gray-700 leading-relaxed">
                  Use Normal, Uniform, Exponential, and other distributions to generate realistic attributes with mathematical precision.
                </p>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-200 p-8 rounded-3xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-3xl"></div>
              <div className="relative text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900">AI-Powered</h3>
                <p className="text-gray-700 leading-relaxed">
                  Create personas from natural language prompts using OpenAI or LangChain integration with advanced AI capabilities.
                </p>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 p-8 rounded-3xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl"></div>
              <div className="relative text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">👥</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900">Group Management</h3>
                <p className="text-gray-700 leading-relaxed">
                  Manage collections of personas with statistical analysis and structured output generation at enterprise scale.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl p-12 shadow-2xl border border-indigo-100">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-4">See It In Action</h2>
            <p className="text-xl text-gray-600 font-medium">Generate realistic personas with correlations in <span className="font-bold text-blue-600">milliseconds</span></p>
          </div>
          <div className="bg-white rounded-2xl p-2 shadow-xl border border-gray-200">
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
        </div>
      </main>
      
      {/* Call to Action */}
      <section className="relative overflow-hidden mt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative text-center py-24 px-8">
          <div className="space-y-8 max-w-4xl mx-auto">
            <h2 className="text-6xl font-black text-white leading-tight">
              Ready to Build the
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Future of Personas?
              </span>
            </h2>
            <p className="text-2xl text-blue-100 font-medium leading-relaxed">
              Join thousands of developers using Persona SDK to create
              <br />
              more realistic, data-driven applications
            </p>
            
            <div className="flex flex-col lg:flex-row gap-6 justify-center items-center pt-8">
              <Link href="/docs" className="group px-16 py-6 bg-white text-blue-600 rounded-2xl font-black text-xl hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2">
                Start Building Today
                <span className="ml-3 group-hover:translate-x-2 transition-transform duration-300">🚀</span>
              </Link>
              <a href="https://github.com/jamesaphoenix/persona-sdk" className="px-16 py-6 border-2 border-white/40 text-white rounded-2xl font-black text-xl hover:bg-white/10 hover:border-white/60 transition-all duration-300 backdrop-blur-sm">
                View on GitHub
              </a>
            </div>
            
            <div className="pt-12 text-blue-200 text-lg">
              ⭐ Trusted by developers at top companies worldwide
            </div>
          </div>
        </div>
      </section>
      
      <footer className="relative z-10 bg-gray-900 text-white">
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