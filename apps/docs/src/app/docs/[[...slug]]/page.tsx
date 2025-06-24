import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';
import { TableOfContents } from '@/components/TableOfContents';
import { MobileNavigation } from '@/components/MobileNavigation';

const navigation = [
  { name: 'Introduction', href: '/docs' },
  { name: 'Quick Start', href: '/docs/quick-start' },
  { name: 'Persona', href: '/docs/persona' },
  { name: 'PersonaBuilder', href: '/docs/persona-builder' },
  { name: 'PersonaGroup', href: '/docs/persona-group' },
  { name: 'Distributions', href: '/docs/distributions' },
  { name: 'Correlations', href: '/docs/correlations' },
  { name: 'AI Features', href: '/docs/ai' },
  { name: 'Media to Persona', href: '/docs/media-to-persona' },
  { name: 'Real-World Examples', href: '/docs/real-world-examples' },
  { name: 'Prompt Optimization', href: '/docs/prompt-optimization' },
  { name: 'Advanced Usage', href: '/docs/advanced' },
  { name: 'API Reference', href: '/docs/api' },
];

const pageContent: Record<string, { title: string; content: JSX.Element }> = {
  index: {
    title: 'Persona SDK',
    content: (
      <div className="space-y-24">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-50"></div>
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="relative text-center space-y-12 py-24">
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
                <Link href="/docs/quick-start" className="group px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1">
                  Start Building Now
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
                <Link href="/docs/real-world-examples" className="px-12 py-5 bg-white/90 backdrop-blur-sm border-2 border-gray-300 text-gray-800 rounded-2xl font-bold text-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-xl">
                  See Examples
                </Link>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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
        </div>

        {/* Installation */}
        <section className="relative">
          <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-3xl p-12 shadow-2xl">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold text-white mb-8">Get Started in Seconds</h2>
              <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <CodeBlock 
                  code="npm install @jamesaphoenix/persona-sdk"
                  language="bash"
                />
              </div>
              <p className="text-blue-200 text-lg">Zero dependencies • TypeScript included • Works everywhere</p>
            </div>
          </div>
        </section>

        {/* Showcase Example */}
        <section className="relative space-y-16">
          <div className="text-center space-y-6">
            <h2 className="text-5xl font-black bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">See the Magic</h2>
            <p className="text-2xl text-gray-600 font-medium">Generate 1000 realistic personas with correlations in <span className="font-bold text-blue-600">milliseconds</span></p>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl p-12 shadow-2xl border border-indigo-100">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-2 shadow-xl border border-gray-200">
                  <CodeBlock 
                    code={`import { PersonaGroup, NormalDistribution } from '@jamesaphoenix/persona-sdk';

// Generate 1000 realistic tech workers
const team = await PersonaGroup.generate({
  name: 'Tech Workforce',
  size: 1000,
  attributes: {
    age: new NormalDistribution(32, 8),
    salary: new NormalDistribution(95000, 25000),
    experience: new NormalDistribution(6, 3)
  },
  correlations: [
    { attribute1: 'age', attribute2: 'salary', correlation: 0.7 },
    { attribute1: 'experience', attribute2: 'salary', correlation: 0.8 }
  ]
});

// Instant insights
const insights = team.getStatistics('salary');
console.log(\`Average salary: $\${insights.mean.toLocaleString()}\`);
// → Average salary: $94,750`}
                    filename="generate-team.ts"
                    showLineNumbers
                  />
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white p-8 rounded-2xl shadow-xl">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    Statistically Perfect
                  </h3>
                  <ul className="space-y-3 text-emerald-50">
                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-white rounded-full"></span>Age-appropriate experience levels</li>
                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-white rounded-full"></span>Salary correlates with seniority</li>
                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-white rounded-full"></span>Statistically valid distributions</li>
                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-white rounded-full"></span>No impossible combinations</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-8 rounded-2xl shadow-xl">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    Lightning Fast
                  </h3>
                  <ul className="space-y-3 text-blue-50">
                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-white rounded-full"></span>1000 personas in ~50ms</li>
                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-white rounded-full"></span>Memory efficient streaming</li>
                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-white rounded-full"></span>Reproducible with seeds</li>
                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-white rounded-full"></span>TypeScript performance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="space-y-16">
          <div className="text-center space-y-6">
            <h2 className="text-5xl font-black bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent">Powerful Features</h2>
            <p className="text-2xl text-gray-600 font-medium">Everything you need to build incredible experiences</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/docs/distributions" className="group relative bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 p-8 rounded-3xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-3xl"></div>
              <div className="relative text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🎲</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900">Statistical Distributions</h3>
                <p className="text-gray-700 leading-relaxed">Normal, Uniform, Exponential, Beta, Poisson, and custom distributions for realistic data generation</p>
              </div>
            </Link>

            <Link href="/docs/ai" className="group relative bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-200 p-8 rounded-3xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-3xl"></div>
              <div className="relative text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900">AI-Powered Generation</h3>
                <p className="text-gray-700 leading-relaxed">Create personas from text prompts and analyze media content with advanced AI</p>
              </div>
            </Link>

            <Link href="/docs/correlations" className="group relative bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 p-8 rounded-3xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl"></div>
              <div className="relative text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🔗</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900">Realistic Correlations</h3>
                <p className="text-gray-700 leading-relaxed">Model real-world relationships between attributes for authentic data patterns</p>
              </div>
            </Link>

            <Link href="/docs/persona-group" className="group relative bg-gradient-to-br from-orange-50 to-red-100 border-2 border-orange-200 p-8 rounded-3xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-3xl"></div>
              <div className="relative text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">👥</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900">Group Management</h3>
                <p className="text-gray-700 leading-relaxed">Powerful tools for managing persona collections at scale</p>
              </div>
            </Link>

            <Link href="/docs/ai#focus-groups" className="group relative bg-gradient-to-br from-pink-50 to-rose-100 border-2 border-pink-200 p-8 rounded-3xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 rounded-3xl"></div>
              <div className="relative text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900">Focus Groups</h3>
                <p className="text-gray-700 leading-relaxed">Simulate discussions with diverse perspectives and insights</p>
              </div>
            </Link>

            <Link href="/docs/real-world-examples" className="group relative bg-gradient-to-br from-indigo-50 to-blue-100 border-2 border-indigo-200 p-8 rounded-3xl hover:shadow-2xl hover:scale-105 transition-all duration-300 md:col-span-2 lg:col-span-3">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-3xl"></div>
              <div className="relative text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="font-bold text-2xl text-gray-900">Real-World Examples</h3>
                <p className="text-gray-700 leading-relaxed text-lg max-w-2xl mx-auto">CTR prediction, market research, A/B testing, and more production use cases</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Call to Action */}
        <section className="relative overflow-hidden">
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
                <Link href="/docs/quick-start" className="group px-16 py-6 bg-white text-blue-600 rounded-2xl font-black text-xl hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2">
                  Start Building Today
                  <span className="ml-3 group-hover:translate-x-2 transition-transform duration-300">🚀</span>
                </Link>
                <Link href="/docs/api" className="px-16 py-6 border-2 border-white/40 text-white rounded-2xl font-black text-xl hover:bg-white/10 hover:border-white/60 transition-all duration-300 backdrop-blur-sm">
                  Explore API
                </Link>
              </div>
              
              <div className="pt-12 text-blue-200 text-lg">
                ⭐ Trusted by developers at top companies worldwide
              </div>
            </div>
          </div>
        </section>
      </div>
    ),
  },
  'persona-builder': {
    title: 'PersonaBuilder',
    content: (
      <div className="space-y-8">
        <p className="text-xl text-gray-600 leading-relaxed">
          PersonaBuilder provides a fluent API for constructing personas with method chaining, distributions, and AI-powered generation.
        </p>
        
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Basic Builder Usage</h2>
          <p className="text-gray-600 mb-4">Create personas using the fluent builder pattern:</p>
          <CodeBlock 
            code={`import { PersonaBuilder } from '@jamesaphoenix/persona-sdk';

// Basic fluent API
const persona = PersonaBuilder.create()
  .withName('Emma Rodriguez')
  .withAge(29)
  .withOccupation('Data Scientist')
  .withSex('female')
  .withAttribute('education', 'PhD in Statistics')
  .withAttribute('programmingLanguages', ['Python', 'R', 'SQL'])
  .withAttribute('yearsExperience', 5)
  .build();

console.log(persona.toObject());`}
            filename="basic-builder.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Using Distributions</h2>
          <p className="text-gray-600 mb-4">Mix static values with statistical distributions for variety:</p>
          <CodeBlock 
            code={`import { PersonaBuilder, NormalDistribution, CategoricalDistribution } from '@jamesaphoenix/persona-sdk';

// Using distributions for dynamic values
const persona = PersonaBuilder.create()
  .withName('Random Employee')
  .withAge(new NormalDistribution(35, 7)) // Mean 35, StdDev 7
  .withOccupation(new CategoricalDistribution([
    { value: 'Engineer', probability: 0.4 },
    { value: 'Designer', probability: 0.3 },
    { value: 'Manager', probability: 0.3 }
  ]))
  .withSex('other')
  .withAttribute('salary', new NormalDistribution(85000, 15000))
  .build();

// Each build() call generates different values
const persona1 = builder.build(); // age: 32, occupation: 'Engineer'
const persona2 = builder.build(); // age: 41, occupation: 'Designer'`}
            filename="builder-distributions.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Building Multiple Personas</h2>
          <p className="text-gray-600 mb-4">Generate multiple personas with variations:</p>
          <CodeBlock 
            code={`// Build multiple personas at once
const personas = PersonaBuilder.create()
  .withAge(new NormalDistribution(30, 5))
  .withOccupation(new CategoricalDistribution([
    { value: 'Developer', probability: 0.6 },
    { value: 'QA Engineer', probability: 0.4 }
  ]))
  .withSex('other')
  .buildMany(10, 'Employee'); // Creates Employee 1, Employee 2, etc.

console.log(\`Generated \${personas.length} personas\`);
personas.forEach(p => console.log(\`\${p.name}: \${p.age} year old \${p.occupation}\`));`}
            filename="build-many.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">AI-Powered Generation</h2>
          <p className="text-gray-600 mb-4">Generate personas from natural language descriptions:</p>
          <CodeBlock 
            code={`// Generate from text prompt
const persona = await PersonaBuilder.fromPrompt(
  'Create a 28-year-old freelance graphic designer who loves travel and coffee',
  { apiKey: process.env.OPENAI_API_KEY }
);

console.log(persona.toObject());
// Result might include:
// {
//   name: 'Maya Patel',
//   age: 28,
//   occupation: 'Freelance Graphic Designer',
//   interests: ['travel', 'coffee', 'design'],
//   personality: 'creative, adventurous, detail-oriented'
// }

// Generate multiple diverse personas
const personas = await PersonaBuilder.generateMultiple(
  'Tech startup employees in their 20s-30s',
  5,
  { apiKey: process.env.OPENAI_API_KEY }
);`}
            filename="ai-generation.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Correlated Generation</h2>
          <p className="text-gray-600 mb-4">Create personas with realistic attribute relationships:</p>
          <CodeBlock 
            code={`// Generate with correlations
const persona = PersonaBuilder.create()
  .withName('Realistic Professional')
  .buildWithCorrelations({
    attributes: {
      age: new NormalDistribution(35, 8),
      income: new NormalDistribution(75000, 25000),
      yearsExperience: new NormalDistribution(10, 5)
    },
    correlations: [
      { attribute1: 'age', attribute2: 'income', correlation: 0.6 },
      { attribute1: 'age', attribute2: 'yearsExperience', correlation: 0.8 }
    ],
    conditionals: [{
      attribute: 'yearsExperience',
      dependsOn: 'age',
      transform: (exp, age) => Math.min(exp, Math.max(0, age - 22))
    }]
  });

// Results in realistic combinations:
// 45-year-old with 20 years experience and $95k income
// 25-year-old with 3 years experience and $55k income`}
            filename="correlated-generation.ts"
            showLineNumbers
          />
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">✨ Builder Methods</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li><code className="bg-white px-2 py-1 rounded">withName()</code> - Set persona name</li>
              <li><code className="bg-white px-2 py-1 rounded">withAge()</code> - Set age (static or distribution)</li>
              <li><code className="bg-white px-2 py-1 rounded">withOccupation()</code> - Set occupation</li>
              <li><code className="bg-white px-2 py-1 rounded">withSex()</code> - Set sex/gender</li>
              <li><code className="bg-white px-2 py-1 rounded">withAttribute()</code> - Add custom attribute</li>
              <li><code className="bg-white px-2 py-1 rounded">withAttributes()</code> - Add multiple attributes</li>
            </ul>
          </div>
          <div className="bg-purple-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">🔧 Build Methods</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li><code className="bg-white px-2 py-1 rounded">build()</code> - Create single persona</li>
              <li><code className="bg-white px-2 py-1 rounded">buildMany()</code> - Create multiple personas</li>
              <li><code className="bg-white px-2 py-1 rounded">buildWithCorrelations()</code> - Create with correlations</li>
            </ul>
          </div>
        </section>
      </div>
    ),
  },
  persona: {
    title: 'Persona Class',
    content: (
      <div className="space-y-8">
        <p className="text-xl text-gray-600 leading-relaxed">
          The Persona class represents an individual with various attributes like age, occupation, and custom properties. It's the fundamental building block of the SDK.
        </p>
        
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Basic Usage</h2>
          <p className="text-gray-600 mb-4">Create personas directly with the constructor:</p>
          <CodeBlock 
            code={`// Direct instantiation
const persona = new Persona('John Doe', {
  age: 30,
  occupation: 'Engineer',
  sex: 'male',
  income: 75000
});

// Access properties
console.log(persona.name);       // 'John Doe'
console.log(persona.age);        // 30
console.log(persona.occupation); // 'Engineer'`}
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Builder Pattern</h2>
          <p className="text-gray-600 mb-4">Use the fluent builder API for more readable code:</p>
          <CodeBlock 
            code={`const persona = PersonaBuilder.create()
  .setName('Jane Smith')
  .setAge(25)
  .setOccupation('Designer')
  .setSex('female')
  .setCustom('skills', ['UI/UX', 'Prototyping'])
  .build();`}
            showLineNumbers
          />
        </section>

        <section className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3">💡 Pro Tip</h3>
          <p className="text-gray-700">
            The builder pattern allows you to chain methods and provides better IntelliSense support in your IDE. It also validates inputs as you build.
          </p>
        </section>
      </div>
    ),
  },
  'persona-group': {
    title: 'PersonaGroup',
    content: (
      <div className="space-y-8">
        <p className="text-xl text-gray-600 leading-relaxed">
          PersonaGroup is a powerful container for managing collections of personas. It provides methods for bulk generation, statistical analysis, and AI-powered insights.
        </p>
        
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Creating Groups</h2>
          <p className="text-gray-600 mb-4">Build groups manually or generate them using distributions:</p>
          <CodeBlock 
            code={`const group = new PersonaGroup('Marketing Audience');

// Add personas manually
group.add(new Persona('Alice', { age: 25, occupation: 'Designer' }));
group.add(new Persona('Bob', { age: 30, occupation: 'Developer' }));

// Generate 100 personas from distributions
group.generateFromDistributions(100, {
  age: new NormalDistribution(30, 5),
  occupation: new CategoricalDistribution([
    { value: 'Developer', probability: 0.6 },
    { value: 'Manager', probability: 0.4 }
  ])
});`}
            filename="persona-group-example.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Group Statistics</h2>
          <p className="text-gray-600 mb-4">Analyze your persona groups with built-in statistical methods:</p>
          <CodeBlock 
            code={`const stats = group.getStatistics('age');
console.log(\`Average age: \${stats.mean}\`);
console.log(\`Age range: \${stats.min} - \${stats.max}\`);
console.log(\`Standard deviation: \${stats.stdDev}\`);

// Filter personas
const seniors = group.filter(p => p.age > 50);
console.log(\`Seniors: \${seniors.length}\`);`}
            showLineNumbers
          />
        </section>

        <section>
          <h2>Key Methods</h2>
          <h3>add()</h3>
          <p>Add a persona to the group.</p>
          <CodeBlock 
            code={`const group = new PersonaGroup('My Team');
const persona = PersonaBuilder.create()
  .withName('Alice')
  .withAge(30)
  .build();

group.add(persona);
console.log(group.size); // 1`}
          />

          <h3>remove()</h3>
          <p>Remove a persona by ID.</p>
          <CodeBlock 
            code={`const removed = group.remove(persona.id);
console.log(removed); // true if found and removed`}
          />

          <h3>filter()</h3>
          <p>Filter personas based on criteria.</p>
          <CodeBlock 
            code={`const developers = group.filter(p => 
  p.occupation === 'Developer'
);

const seniors = group.filter(p => 
  p.age >= 35
);`}
          />

          <h3>getStatistics()</h3>
          <p>Get statistical analysis of an attribute.</p>
          <CodeBlock 
            code={`const ageStats = group.getStatistics('age');
console.log(ageStats.mean);     // Average age
console.log(ageStats.median);   // Median age
console.log(ageStats.stdDev);   // Standard deviation`}
          />
        </section>

        <section>
          <h2>Properties</h2>
          <h3>size</h3>
          <p>Number of personas in the group.</p>
          <CodeBlock 
            code={`console.log(group.size); // Returns count of personas`}
          />

          <h3>personas</h3>
          <p>Array of all personas in the group.</p>
          <CodeBlock 
            code={`const allPersonas = group.personas;
allPersonas.forEach(persona => {
  console.log(persona.name);
});`}
          />

          <h3>name</h3>
          <p>Name of the persona group.</p>
          <CodeBlock 
            code={`console.log(group.name); // "My Team"`}
          />
        </section>
      </div>
    ),
  },
  correlations: {
    title: 'Correlations & Realistic Relationships',
    content: (
      <div className="space-y-8">
        <p className="text-xl text-gray-600 leading-relaxed">
          Create realistic personas by modeling real-world relationships between attributes like age-income correlation, education-salary relationships, and experience-skill dependencies.
        </p>
        
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Basic Correlations</h2>
          <p className="text-gray-600 mb-4">Define linear relationships between numeric attributes:</p>
          <CodeBlock 
            code={`import { PersonaGroup, NormalDistribution } from '@jamesaphoenix/persona-sdk';

const group = new PersonaGroup('Professionals');

// Generate personas with age-income correlation
group.generateWithCorrelations(100, {
  attributes: {
    age: new NormalDistribution(35, 8),
    income: new NormalDistribution(75000, 20000),
    yearsExperience: new NormalDistribution(10, 5)
  },
  correlations: [
    // Older people tend to earn more
    { attribute1: 'age', attribute2: 'income', correlation: 0.6 },
    // Age correlates with experience
    { attribute1: 'age', attribute2: 'yearsExperience', correlation: 0.8 },
    // Experience correlates with income
    { attribute1: 'yearsExperience', attribute2: 'income', correlation: 0.7 }
  ]
});

// Results in realistic combinations:
// 45-year-old, 18 years exp, $95k income
// 28-year-old, 5 years exp, $65k income`}
            filename="basic-correlations.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Conditional Dependencies</h2>
          <p className="text-gray-600 mb-4">Add logical constraints and transformations:</p>
          <CodeBlock 
            code={`// Add realistic constraints
group.generateWithCorrelations(50, {
  attributes: {
    age: new NormalDistribution(32, 7),
    yearsExperience: new NormalDistribution(8, 4),
    education: new CategoricalDistribution([
      { value: 'High School', probability: 0.2 },
      { value: 'Bachelor', probability: 0.5 },
      { value: 'Master', probability: 0.25 },
      { value: 'PhD', probability: 0.05 }
    ])
  },
  conditionals: [
    {
      // Experience can't exceed working years (age - 18)
      attribute: 'yearsExperience',
      dependsOn: 'age',
      transform: (experience, age) => {
        const maxExperience = Math.max(0, age - 18);
        return Math.min(experience, maxExperience);
      }
    },
    {
      // Adjust income based on education level
      attribute: 'income',
      dependsOn: 'education',
      transform: (baseIncome, education) => {
        const multipliers = {
          'High School': 0.8,
          'Bachelor': 1.0,
          'Master': 1.3,
          'PhD': 1.6
        };
        return baseIncome * (multipliers[education] || 1.0);
      }
    }
  ]
});`}
            filename="conditional-dependencies.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Correlation Patterns</h2>
          <p className="text-gray-600 mb-4">Use built-in correlation patterns for realistic relationships:</p>
          <CodeBlock 
            code={`import { CommonCorrelations, PersonaCorrelationPresets } from '@jamesaphoenix/persona-sdk';

// Use built-in correlation functions
const correlatedIncome = CommonCorrelations.ageIncome(50000, age);
const boundedExperience = CommonCorrelations.ageExperience(experience, age);
const realisticWeight = CommonCorrelations.heightWeight(weight, height);
const educationBonus = CommonCorrelations.educationIncome(income, educationYears);

// Use preset correlation configurations
group.generateWithCorrelations(100, {
  ...PersonaCorrelationPresets.REALISTIC_ADULT,
  // Adds common correlations:
  // - Age ↔ Income (0.5)
  // - Age ↔ Experience (0.8)
  // - Height ↔ Weight (0.7)
  // - Education ↔ Income (0.6)
});

// Professional preset for workplace personas
group.generateWithCorrelations(50, {
  ...PersonaCorrelationPresets.PROFESSIONAL,
  // Adds workplace-specific correlations:
  // - Experience ↔ Salary (0.8)
  // - Education ↔ Position Level (0.7)
  // - Age ↔ Management Role (0.6)
});`}
            filename="correlation-patterns.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Correlation Types</h2>
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Linear Correlation</h3>
              <p className="text-gray-600 mb-4">Direct proportional relationship (default):</p>
              <CodeBlock 
                code={`{
  attribute1: 'age',
  attribute2: 'income',
  correlation: 0.6,
  type: 'linear' // As age increases, income increases proportionally
}`}
              />
            </div>

            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Exponential Correlation</h3>
              <p className="text-gray-600 mb-4">Accelerating relationship for compound effects:</p>
              <CodeBlock 
                code={`{
  attribute1: 'yearsExperience',
  attribute2: 'skillLevel',
  correlation: 0.7,
  type: 'exponential' // Skill grows faster with more experience
}`}
              />
            </div>

            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Logarithmic Correlation</h3>
              <p className="text-gray-600 mb-4">Diminishing returns relationship:</p>
              <CodeBlock 
                code={`{
  attribute1: 'hoursStudied',
  attribute2: 'testScore',
  correlation: 0.5,
  type: 'logarithmic' // Returns diminish with more study time
}`}
              />
            </div>
          </div>
        </section>

        <section className="bg-orange-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Best Practices</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• <strong>Keep correlations realistic:</strong> Use values between -0.8 and 0.8 for most relationships</li>
            <li>• <strong>Add logical constraints:</strong> Use conditionals to prevent impossible combinations</li>
            <li>• <strong>Layer correlations:</strong> Build complex relationships by combining multiple simple ones</li>
            <li>• <strong>Test your model:</strong> Generate samples and verify the relationships make sense</li>
            <li>• <strong>Use presets:</strong> Start with built-in patterns and customize as needed</li>
          </ul>
        </section>
      </div>
    ),
  },
  distributions: {
    title: 'Statistical Distributions',
    content: (
      <div className="space-y-8">
        <p className="text-xl text-gray-600 leading-relaxed">
          Statistical distributions are the foundation of realistic data generation. The SDK provides a comprehensive set of distributions to model various real-world scenarios.
        </p>
        
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Available Distributions</h2>
          
          <div className="space-y-8">
            {/* Normal Distribution */}
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Normal Distribution</h3>
              <p className="text-gray-600 mb-4">Bell curve distribution, perfect for natural phenomena like height, weight, or IQ.</p>
              <CodeBlock 
                code={`const age = new NormalDistribution(35, 10);
// mean: 35, stdDev: 10
const sample = age.sample(); // e.g., 32.5`}
              />
            </div>

            {/* Uniform Distribution */}
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Uniform Distribution</h3>
              <p className="text-gray-600 mb-4">Equal probability across a range, ideal for random selections within bounds.</p>
              <CodeBlock 
                code={`const income = new UniformDistribution(40000, 120000);
// min: 40k, max: 120k
const sample = income.sample(); // e.g., 75432`}
              />
            </div>

            {/* Categorical Distribution */}
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Categorical Distribution</h3>
              <p className="text-gray-600 mb-4">Discrete values with probabilities, perfect for categories like occupation or status.</p>
              <CodeBlock 
                code={`const occupation = new CategoricalDistribution([
  { value: 'Engineer', probability: 0.4 },
  { value: 'Designer', probability: 0.3 },
  { value: 'Manager', probability: 0.3 }
]);
const sample = occupation.sample(); // e.g., 'Engineer'`}
              />
            </div>

            {/* Exponential Distribution */}
            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Exponential Distribution</h3>
              <p className="text-gray-600 mb-4">Time between events, like customer arrivals.</p>
              <CodeBlock 
                code={`const waitTime = new ExponentialDistribution(0.5);
// lambda: 0.5 (rate parameter)
const sample = waitTime.sample(); // e.g., 1.38 minutes`}
              />
            </div>

            {/* Beta Distribution */}
            <div className="border-l-4 border-red-500 pl-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Beta Distribution</h3>
              <p className="text-gray-600 mb-4">Probabilities and percentages.</p>
              <CodeBlock 
                code={`const successRate = new BetaDistribution(2, 5);
// alpha: 2, beta: 5
const sample = successRate.sample(); // e.g., 0.23 (23%)`}
              />
            </div>

            {/* Poisson Distribution */}
            <div className="border-l-4 border-indigo-500 pl-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Poisson Distribution</h3>
              <p className="text-gray-600 mb-4">Count of events in fixed time.</p>
              <CodeBlock 
                code={`const emailsPerHour = new PoissonDistribution(3);
// lambda: 3 (average events per period)
const sample = emailsPerHour.sample(); // e.g., 2 emails`}
              />
            </div>

            {/* Custom Distribution */}
            <div className="border-l-4 border-gray-500 pl-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Custom Distribution</h3>
              <p className="text-gray-600 mb-4">Create your own distributions.</p>
              <CodeBlock 
                code={`class TriangularDistribution extends BaseDistribution<number> {
  constructor(min: number, max: number, mode: number) {
    super();
    this.min = min;
    this.max = max;
    this.mode = mode;
  }

  sample(): number {
    // Implementation here
    const u = Math.random();
    // ... triangular distribution logic
    return value;
  }
}

const custom = new TriangularDistribution(0, 100, 75);
const sample = custom.sample(); // e.g., 68.2`}
              />
            </div>
          </div>
        </section>
      </div>
    ),
  },
  ai: {
    title: 'AI-Powered Features',
    content: (
      <div className="space-y-8">
        <p className="text-xl text-gray-600 leading-relaxed">
          Harness the power of AI to create personas from natural language, select optimal distributions, and generate deep insights about your persona groups.
        </p>
        
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Create from Prompt</h2>
          <p className="text-gray-600 mb-4">Generate complete personas from natural language descriptions:</p>
          <CodeBlock 
            code={`const persona = await PersonaBuilder.fromPrompt(
  'Create a 25-year-old software developer who enjoys gaming',
  { apiKey: process.env.OPENAI_API_KEY }
);

// Result:
// {
//   name: 'Marcus Chen',
//   age: 25,
//   occupation: 'Software Developer',
//   hobbies: ['gaming', 'coding', 'tech blogs'],
//   personality: 'analytical, creative, introverted'
// }`}
            filename="ai-prompt-example.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Structured Output</h2>
          <p className="text-gray-600 mb-4">Extract structured insights from persona groups using Zod schemas:</p>
          <CodeBlock 
            code={`import { z } from 'zod';

const MarketInsightSchema = z.object({
  targetSegment: z.string(),
  topInterests: z.array(z.string()),
  recommendations: z.array(z.string())
});

const insights = await group.generateStructuredOutput(
  MarketInsightSchema,
  'Analyze this audience for marketing'
);`}
            filename="structured-output.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2>Distribution Selection</h2>
          <p>AI automatically selects the best statistical distribution for your data based on context.</p>
          <CodeBlock 
            code={`import { DistributionSelector } from '@jamesaphoenix/persona-sdk';

const selector = new DistributionSelector({ apiKey: process.env.OPENAI_API_KEY });

const result = await selector.selectDistribution({
  attribute: 'income',
  context: 'Tech startup employees in Silicon Valley',
  constraints: { min: 50000, max: 200000 }
});

// Result: { 
//   type: 'normal', 
//   params: { mean: 120000, stdDev: 25000 },
//   reasoning: 'Normal distribution fits tech salaries...'
// }`}
          />
        </section>

        <section>
          <h2>Media-to-Persona</h2>
          <p>Generate personas from images, videos, or audio content analysis.</p>
          <CodeBlock 
            code={`import { MediaToPersonaGenerator } from '@jamesaphoenix/persona-sdk';

const generator = new MediaToPersonaGenerator();

// From image
const personas = await generator.fromImage('./lifestyle-photo.jpg');

// From video
const personas = await generator.fromVideo('./customer-interview.mp4');

// From audio
const personas = await generator.fromAudio('./podcast-segment.mp3');

console.log(personas[0].attributes);
// { age: 28, lifestyle: 'urban professional', interests: ['fitness', 'technology'] }`}
          />
        </section>

        <section>
          <h2>Focus Groups</h2>
          <p>Simulate focus group discussions with diverse persona perspectives.</p>
          <CodeBlock 
            code={`import { FocusGroupSimulator } from '@jamesaphoenix/persona-sdk';

const simulator = new FocusGroupSimulator();

const discussion = await simulator.simulate({
  personas: techStartupGroup,
  topic: 'New mobile app features',
  duration: '30 minutes',
  moderatorStyle: 'structured'
});

console.log(discussion.transcript);
// [
//   { speaker: 'Alice (Designer)', message: 'I think the UI should be...' },
//   { speaker: 'Bob (Engineer)', message: 'From a technical standpoint...' }
// ]`}
          />
        </section>

        <section>
          <h2>LangChain Integration</h2>
          <p>Build complex AI pipelines with LangChain compatibility.</p>
          <CodeBlock 
            code={`import { PersonaChain } from '@jamesaphoenix/persona-sdk';
import { ChatOpenAI } from 'langchain/chat_models/openai';

const chain = new PersonaChain({
  llm: new ChatOpenAI({ temperature: 0.7 }),
  personas: marketingGroup
});

const result = await chain.invoke({
  input: 'Analyze market reaction to product launch',
  outputSchema: MarketAnalysisSchema
});

// Integrates seamlessly with LangChain pipelines
const pipeline = chain.pipe(analysisChain).pipe(reportChain);`}
          />
        </section>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-2">⚡ Performance Tip</h4>
          <p className="text-gray-700">Use environment variables for API keys and consider caching AI-generated personas to reduce API costs.</p>
        </div>
      </div>
    ),
  },
  'quick-start': {
    title: 'Quick Start',
    content: (
      <div className="space-y-8">
        <p className="text-xl text-gray-600 leading-relaxed">
          Get up and running with the Persona SDK in just a few minutes. This guide covers installation, basic usage, and your first persona generation.
        </p>
        
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Installation</h2>
          <CodeBlock 
            code="npm install @jamesaphoenix/persona-sdk"
            language="bash"
          />
          <p className="text-gray-600 mt-4">Or using other package managers:</p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <CodeBlock code="pnpm add @jamesaphoenix/persona-sdk" language="bash" />
            <CodeBlock code="yarn add @jamesaphoenix/persona-sdk" language="bash" />
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Your First Persona</h2>
          <p className="text-gray-600 mb-4">Create a basic persona with required attributes:</p>
          <CodeBlock 
            code={`import { Persona } from '@jamesaphoenix/persona-sdk';

// Create a persona with required attributes
const persona = new Persona('Alice Johnson', {
  age: 28,
  occupation: 'UX Designer',
  sex: 'female'
});

console.log(persona.toObject());
// Output:
// {
//   id: 'persona_1234567890_abcdef',
//   name: 'Alice Johnson',
//   attributes: {
//     age: 28,
//     occupation: 'UX Designer',
//     sex: 'female'
//   }
// }`}
            filename="basic-persona.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Adding Custom Attributes</h2>
          <p className="text-gray-600 mb-4">Extend personas with any custom attributes you need:</p>
          <CodeBlock 
            code={`const persona = new Persona('Bob Wilson', {
  age: 35,
  occupation: 'Software Engineer',
  sex: 'male',
  // Custom attributes
  salary: 95000,
  skills: ['JavaScript', 'Python', 'React'],
  location: 'San Francisco',
  yearsExperience: 8,
  isRemote: true,
  hobbies: ['photography', 'hiking']
});

// Access attributes
console.log(persona.age); // 35
console.log(persona.attributes.salary); // 95000
console.log(persona.attributes.skills); // ['JavaScript', 'Python', 'React']`}
            filename="custom-attributes.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Using the Builder Pattern</h2>
          <p className="text-gray-600 mb-4">Use PersonaBuilder for a more fluent API:</p>
          <CodeBlock 
            code={`import { PersonaBuilder } from '@jamesaphoenix/persona-sdk';

const persona = PersonaBuilder.create()
  .withName('Sarah Chen')
  .withAge(32)
  .withOccupation('Product Manager')
  .withSex('female')
  .withAttribute('department', 'Engineering')
  .withAttribute('teamSize', 12)
  .withAttribute('budget', 500000)
  .build();

console.log(persona.getSummary());
// "Sarah Chen is a 32-year-old Product Manager"`}
            filename="builder-pattern.ts"
            showLineNumbers
          />
        </section>

        <section className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3">🎯 Next Steps</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Learn about <Link href="/docs/distributions" className="text-blue-600 hover:underline">Statistical Distributions</Link> for realistic data generation</li>
            <li>• Explore <Link href="/docs/persona-group" className="text-blue-600 hover:underline">PersonaGroup</Link> for managing collections</li>
            <li>• Try <Link href="/docs/ai" className="text-blue-600 hover:underline">AI Features</Link> for natural language generation</li>
            <li>• Check out <Link href="/docs/correlations" className="text-blue-600 hover:underline">Correlations</Link> for realistic relationships</li>
          </ul>
        </section>
      </div>
    ),
  },
  advanced: {
    title: 'Advanced Usage',
    content: (
      <div className="space-y-8">
        <p className="text-xl text-gray-600 leading-relaxed">
          Explore advanced patterns for custom distributions, validation, serialization, and extending the Persona SDK for complex use cases.
        </p>
        
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Custom Distributions</h2>
          <p className="text-gray-600 mb-4">Create your own distribution classes by extending BaseDistribution:</p>
          <CodeBlock 
            code={`import { BaseDistribution } from '@jamesaphoenix/persona-sdk';

// Custom triangular distribution
export class TriangularDistribution extends BaseDistribution<number> {
  constructor(
    private readonly min: number,
    private readonly max: number,
    private readonly mode: number,
    seed?: number
  ) {
    super(seed);
    if (min >= max || mode < min || mode > max) {
      throw new Error('Invalid triangular distribution parameters');
    }
  }

  sample(): number {
    const u = this.random.real(0, 1, false);
    const F = (this.mode - this.min) / (this.max - this.min);
    
    if (u < F) {
      return this.min + Math.sqrt(u * (this.max - this.min) * (this.mode - this.min));
    } else {
      return this.max - Math.sqrt((1 - u) * (this.max - this.min) * (this.max - this.mode));
    }
  }

  mean(): number {
    return (this.min + this.max + this.mode) / 3;
  }

  variance(): number {
    const a = this.min, b = this.max, c = this.mode;
    return (a*a + b*b + c*c - a*b - a*c - b*c) / 18;
  }

  toString(): string {
    return \`Triangular(\${this.min}, \${this.max}, \${this.mode})\`;
  }
}

// Use in PersonaBuilder
const persona = PersonaBuilder.create()
  .withAge(new TriangularDistribution(22, 65, 35)) // Most people around 35
  .withName('Professional')
  .build();`}
            filename="custom-distribution.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Validation & Constraints</h2>
          <p className="text-gray-600 mb-4">Add validation rules and constraints to ensure data quality:</p>
          <CodeBlock 
            code={`import { PersonaBuilder, ValidationRule } from '@jamesaphoenix/persona-sdk';

// Custom validation rules
const ageValidation: ValidationRule = {
  attribute: 'age',
  validate: (value: any) => {
    if (typeof value !== 'number' || value < 0 || value > 120) {
      throw new Error('Age must be between 0 and 120');
    }
    return true;
  }
};

const emailValidation: ValidationRule = {
  attribute: 'email',
  validate: (value: any) => {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (typeof value !== 'string' || !emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }
    return true;
  }
};

// Builder with validation
const persona = PersonaBuilder.create()
  .withValidation([ageValidation, emailValidation])
  .withAge(28)
  .withAttribute('email', 'alice@example.com')
  .withAttribute('salary', 75000)
  .addConstraint('salary', (value) => value > 0 && value < 1000000)
  .build();

// Validation runs automatically during build()
console.log('Persona created with valid data:', persona.toObject());`}
            filename="validation.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Serialization & Persistence</h2>
          <p className="text-gray-600 mb-4">Save and load personas with complete state preservation:</p>
          <CodeBlock 
            code={`import { PersonaGroup, PersonaSerializer } from '@jamesaphoenix/persona-sdk';

// Create and populate group
const group = new PersonaGroup('Engineering Team');
group.add(PersonaBuilder.create()
  .withName('Alice')
  .withAge(28)
  .withOccupation('Developer')
  .build()
);

// Serialize to JSON
const serialized = PersonaSerializer.serialize(group);
console.log('Serialized:', JSON.stringify(serialized, null, 2));

// Save to file
await PersonaSerializer.saveToFile(group, 'team.json');

// Load from file
const loadedGroup = await PersonaSerializer.loadFromFile('team.json');
console.log('Loaded group:', loadedGroup.name, loadedGroup.size);

// Serialize with distributions (preserves random state)
const builderWithDistribution = PersonaBuilder.create()
  .withAge(new NormalDistribution(35, 5, 12345)) // with seed
  .withName('Random Employee');

const serializedBuilder = PersonaSerializer.serializeBuilder(builderWithDistribution);
const restoredBuilder = PersonaSerializer.deserializeBuilder(serializedBuilder);

// Both builders will generate identical personas
const persona1 = builderWithDistribution.build();
const persona2 = restoredBuilder.build();
console.log('Ages match:', persona1.age === persona2.age);`}
            filename="serialization.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Performance Optimization</h2>
          <p className="text-gray-600 mb-4">Optimize for large-scale persona generation:</p>
          <CodeBlock 
            code={`import { PersonaGroup, BatchGenerator } from '@jamesaphoenix/persona-sdk';

// Batch generation for performance
const batchGenerator = new BatchGenerator({
  batchSize: 1000,
  parallelWorkers: 4,
  memoryLimit: '512MB'
});

// Generate 100,000 personas efficiently
const largeGroup = await batchGenerator.generate(100000, {
  template: PersonaBuilder.create()
    .withAge(new NormalDistribution(35, 10))
    .withOccupation(new CategoricalDistribution([
      { value: 'Engineer', probability: 0.4 },
      { value: 'Designer', probability: 0.3 },
      { value: 'Manager', probability: 0.3 }
    ])),
  nameTemplate: 'Employee',
  correlations: [
    { attribute1: 'age', attribute2: 'salary', correlation: 0.6 }
  ]
});

console.log(\`Generated \${largeGroup.size} personas in batches\`);

// Stream processing for memory efficiency
const stream = batchGenerator.createStream(PersonaBuilder.create()
  .withAge(new UniformDistribution(25, 65))
  .withName('Streamed Persona')
);

let count = 0;
for await (const persona of stream) {
  // Process each persona without storing all in memory
  console.log(\`Processing persona \${++count}: \${persona.name}\`);
  
  if (count >= 10000) break; // Process 10k personas
}`}
            filename="performance.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Plugin System</h2>
          <p className="text-gray-600 mb-4">Extend functionality with custom plugins:</p>
          <CodeBlock 
            code={`import { PersonaPlugin, PersonaBuilder } from '@jamesaphoenix/persona-sdk';

// Create a plugin for generating realistic names
class RealisticNamesPlugin implements PersonaPlugin {
  name = 'realistic-names';
  
  async install(builder: PersonaBuilder) {
    // Add methods to builder
    builder.withRealisticName = (demographics: {
      ethnicity?: string;
      gender?: string;
      region?: string;
    }) => {
      const name = this.generateRealisticName(demographics);
      return builder.withName(name);
    };
  }
  
  private generateRealisticName(demographics: any): string {
    // Implementation would use name databases
    // This is a simplified example
    const firstNames = {
      'male': ['James', 'John', 'Robert', 'Michael'],
      'female': ['Mary', 'Patricia', 'Jennifer', 'Linda']
    };
    
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown'];
    
    const first = firstNames[demographics.gender]?.[0] || 'Alex';
    const last = lastNames[0];
    
    return \`\${first} \${last}\`;
  }
}

// Register and use plugin
PersonaBuilder.use(new RealisticNamesPlugin());

const persona = PersonaBuilder.create()
  .withRealisticName({ gender: 'female', ethnicity: 'hispanic' })
  .withAge(30)
  .build();

console.log('Generated realistic persona:', persona.name);`}
            filename="plugins.ts"
            showLineNumbers
          />
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-yellow-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">⚡ Performance Tips</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Use seeded distributions for reproducible results</li>
              <li>• Batch generate for large datasets (&gt;1000 personas)</li>
              <li>• Stream processing for memory-constrained environments</li>
              <li>• Cache compiled distributions for repeated use</li>
              <li>• Use Web Workers for client-side parallel generation</li>
            </ul>
          </div>
          <div className="bg-red-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">🔒 Security & Privacy</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Never include real PII in synthetic personas</li>
              <li>• Use differential privacy for sensitive correlations</li>
              <li>• Validate all inputs in custom distributions</li>
              <li>• Sanitize generated data before persistence</li>
              <li>• Audit persona data for potential privacy leaks</li>
            </ul>
          </div>
        </section>
      </div>
    ),
  },
  api: {
    title: 'API Reference',
    content: (
      <div className="space-y-8">
        <p className="text-xl text-gray-600 leading-relaxed">
          Complete API documentation for all classes, methods, and interfaces in the Persona SDK.
        </p>
        
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Core Classes</h2>
          
          <div className="space-y-8">
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Persona</h3>
              <p className="text-gray-600 mb-4">Main persona class representing an individual with attributes.</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Constructor</h4>
                  <CodeBlock 
                    code={`new Persona(name: string, attributes: PersonaAttributes)`}
                    language="typescript"
                  />
                  <p className="text-sm text-gray-600 mt-2">Creates a new persona with required attributes: age, occupation, sex.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Properties</h4>
                  <CodeBlock 
                    code={`readonly id: string          // Unique identifier
readonly name: string        // Persona name
readonly age: number         // Age in years
readonly occupation: string  // Job/occupation
readonly sex: Sex           // 'male' | 'female' | 'other'
readonly attributes: Record<string, any> // Custom attributes`}
                    language="typescript"
                  />
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Methods</h4>
                  <CodeBlock 
                    code={`toObject(): PersonaData        // Serialize to plain object
toJSON(): string              // Serialize to JSON string
getSummary(): string          // Get human-readable summary
clone(newName?: string): Persona // Create a copy
setAttribute(key: string, value: any): void // Update attribute
getAttribute(key: string): any // Get attribute value
hasAttribute(key: string): boolean // Check if attribute exists`}
                    language="typescript"
                  />
                </div>
              </div>
            </div>
            
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">PersonaBuilder</h3>
              <p className="text-gray-600 mb-4">Fluent API for constructing personas with method chaining.</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Static Methods</h4>
                  <CodeBlock 
                    code={`PersonaBuilder.create(): PersonaBuilder
PersonaBuilder.fromPrompt(prompt: string, options?: AIOptions): Promise<Persona>
PersonaBuilder.generateMultiple(prompt: string, count: number, options?: AIOptions): Promise<Persona[]>`}
                    language="typescript"
                  />
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Builder Methods</h4>
                  <CodeBlock 
                    code={`withName(name: string | Distribution<string>): PersonaBuilder
withAge(age: number | Distribution<number>): PersonaBuilder
withOccupation(occupation: string | Distribution<string>): PersonaBuilder
withSex(sex: Sex): PersonaBuilder
withAttribute(key: string, value: any): PersonaBuilder
withAttributes(attributes: Record<string, any>): PersonaBuilder
withValidation(rules: ValidationRule[]): PersonaBuilder`}
                    language="typescript"
                  />
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Build Methods</h4>
                  <CodeBlock 
                    code={`build(): Persona
buildMany(count: number, namePrefix?: string): Persona[]
buildWithCorrelations(config: CorrelationConfig): Persona`}
                    language="typescript"
                  />
                </div>
              </div>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">PersonaGroup</h3>
              <p className="text-gray-600 mb-4">Collection manager for multiple personas with analysis capabilities.</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Constructor</h4>
                  <CodeBlock 
                    code={`new PersonaGroup(name: string, personas?: Persona[])`}
                    language="typescript"
                  />
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Properties</h4>
                  <CodeBlock 
                    code={`readonly name: string
readonly size: number
readonly personas: Persona[]`}
                    language="typescript"
                  />
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Methods</h4>
                  <CodeBlock 
                    code={`add(persona: Persona): void
addMany(personas: Persona[]): void
remove(id: string): boolean
clear(): void
find(predicate: (persona: Persona) => boolean): Persona | undefined
filter(predicate: (persona: Persona) => boolean): Persona[]
getStatistics(attribute: string): AttributeStatistics
groupBy(attribute: string): Map<any, Persona[]>
sample(count: number): Persona[]
toArray(): Persona[]
toObject(): GroupData`}
                    language="typescript"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Distribution Classes</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">NormalDistribution</h4>
              <CodeBlock 
                code={`new NormalDistribution(
  mean: number,
  stdDev: number,
  seed?: number
)`}
                language="typescript"
              />
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">UniformDistribution</h4>
              <CodeBlock 
                code={`new UniformDistribution(
  min: number,
  max: number,
  seed?: number
)`}
                language="typescript"
              />
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">CategoricalDistribution</h4>
              <CodeBlock 
                code={`new CategoricalDistribution(
  categories: CategoryOption[],
  seed?: number
)`}
                language="typescript"
              />
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">ExponentialDistribution</h4>
              <CodeBlock 
                code={`new ExponentialDistribution(
  lambda: number,
  seed?: number
)`}
                language="typescript"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Distribution Interface</h4>
            <p className="text-gray-600 mb-4">All distributions implement the Distribution interface:</p>
            <CodeBlock 
              code={`interface Distribution<T> {
  sample(): T;           // Generate a random sample
  mean(): number;        // Expected value
  variance(): number;    // Variance
  toString(): string;    // String representation
}`}
              language="typescript"
            />
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Type Definitions</h2>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Core Types</h4>
              <CodeBlock 
                code={`type Sex = 'male' | 'female' | 'other';

interface PersonaAttributes {
  age: number;
  occupation: string;
  sex: Sex;
  [key: string]: any;
}

interface PersonaData {
  id: string;
  name: string;
  attributes: PersonaAttributes;
}

interface GroupData {
  name: string;
  size: number;
  personas: PersonaData[];
}`}
                language="typescript"
              />
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Correlation Types</h4>
              <CodeBlock 
                code={`interface CorrelationConfig {
  attributes: Record<string, Distribution<any>>;
  correlations: Correlation[];
  conditionals?: Conditional[];
}

interface Correlation {
  attribute1: string;
  attribute2: string;
  correlation: number;
  type?: 'linear' | 'exponential' | 'logarithmic';
}

interface Conditional {
  attribute: string;
  dependsOn: string;
  transform: (value: any, dependency: any) => any;
}`}
                language="typescript"
              />
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">AI Integration Types</h4>
              <CodeBlock 
                code={`interface AIOptions {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface StructuredOutputSchema {
  name: string;
  description: string;
  schema: any; // Zod schema
}`}
                language="typescript"
              />
            </div>
          </div>
        </section>

        <section className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📚 Additional Resources</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• <a href="https://github.com/jamesaphoenix/persona-sdk" className="text-blue-600 hover:underline">GitHub Repository</a> - Source code and examples</li>
            <li>• <a href="https://www.npmjs.com/package/@jamesaphoenix/persona-sdk" className="text-blue-600 hover:underline">npm Package</a> - Installation and version info</li>
            <li>• <strong>TypeScript Support:</strong> Full type definitions included</li>
            <li>• <strong>Node.js Compatibility:</strong> Requires Node.js 16+</li>
            <li>• <strong>Browser Support:</strong> Modern browsers with ES2020+ support</li>
          </ul>
        </section>
      </div>
    ),
  },
  'media-to-persona': {
    title: 'Media to Persona',
    content: (
      <div className="space-y-8">
        <p className="text-xl text-gray-600 leading-relaxed">
          Transform any media content—text posts, images, or other formats—into rich, detailed personas. This powerful feature enables you to analyze user-generated content and create representative personas for your target audience.
        </p>
        
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Generate from Social Media Posts</h2>
          <p className="text-gray-600 mb-4">Analyze social media content to understand your audience:</p>
          <CodeBlock 
            code={`import { PersonaBuilder } from '@jamesaphoenix/persona-sdk';

// Generate persona from a social media post
const post = \`Just crushed a 10k run this morning! 🏃‍♂️ 
Feeling amazing. Time to refuel with a protein smoothie and 
get some coding done. #morningrun #developerlife\`;

const persona = await PersonaBuilder.fromPost(post, {
  apiKey: process.env.OPENAI_API_KEY,
  platform: 'twitter' // Optional: twitter, instagram, linkedin
});

console.log(persona.toObject());
// Result:
// {
//   name: 'Alex Chen',
//   age: 28,
//   occupation: 'Software Developer',
//   interests: ['running', 'fitness', 'coding', 'healthy eating'],
//   lifestyle: 'health-conscious, early riser, tech professional',
//   personality: 'motivated, disciplined, achievement-oriented'
// }`}
            filename="social-media-persona.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Generate from Images</h2>
          <p className="text-gray-600 mb-4">Create personas by analyzing image content:</p>
          <CodeBlock 
            code={`// Generate persona from image analysis
const imageUrl = 'https://example.com/user-photo.jpg';

const persona = await PersonaBuilder.fromImage(imageUrl, {
  apiKey: process.env.OPENAI_API_KEY,
  analyzeFor: ['demographics', 'interests', 'lifestyle']
});

// Or from local file
const persona = await PersonaBuilder.fromImageFile('./photo.jpg', {
  apiKey: process.env.OPENAI_API_KEY
});

// Batch processing for multiple images
const photos = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'];
const personas = await PersonaBuilder.fromImages(photos, {
  apiKey: process.env.OPENAI_API_KEY,
  groupAnalysis: true // Analyze as a cohesive group
});`}
            filename="image-persona.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Multi-Media Analysis</h2>
          <p className="text-gray-600 mb-4">Combine multiple media sources for richer personas:</p>
          <CodeBlock 
            code={`import { MediaAnalyzer, PersonaBuilder } from '@jamesaphoenix/persona-sdk';

// Analyze multiple content pieces from one user
const analyzer = new MediaAnalyzer({
  apiKey: process.env.OPENAI_API_KEY
});

// Add various media types
analyzer.addPost('Love exploring new coffee shops while working on my startup!');
analyzer.addImage('workspace-photo.jpg');
analyzer.addPost('Just launched our MVP! 3 months of hard work paying off 🚀');
analyzer.addBio('Entrepreneur | Coffee Enthusiast | Building the future');

// Generate comprehensive persona
const persona = await analyzer.generatePersona({
  confidence: 'high', // Require high confidence in attributes
  includeInferred: true // Include inferred attributes
});

console.log(persona.toObject());
// Result includes deep insights from all media sources`}
            filename="multi-media-analysis.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Content Categories</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">📝 Text Content</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Social media posts</li>
                <li>• Blog comments</li>
                <li>• Reviews and feedback</li>
                <li>• Forum discussions</li>
                <li>• Chat messages</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">🖼️ Visual Content</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Profile photos</li>
                <li>• Lifestyle images</li>
                <li>• Product interactions</li>
                <li>• Environment context</li>
                <li>• Activity photos</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced Options</h2>
          <p className="text-gray-600 mb-4">Fine-tune media analysis with advanced configuration:</p>
          <CodeBlock 
            code={`const persona = await PersonaBuilder.fromPost(content, {
  apiKey: process.env.OPENAI_API_KEY,
  
  // Analysis options
  extractSentiment: true,
  detectPersonality: true,
  inferDemographics: true,
  
  // Confidence thresholds
  minConfidence: 0.7,
  requireExplicitMentions: false,
  
  // Context hints
  domain: 'fitness', // Help focus the analysis
  ageRange: [20, 40], // Constrain demographics
  
  // Output control
  includeRawAnalysis: true,
  generateBackground: true
});

// Access detailed analysis
console.log(persona.attributes.sentiment); // positive, neutral, negative
console.log(persona.attributes.personalityTraits); // Big 5 traits
console.log(persona.attributes.confidence); // Confidence scores`}
            filename="advanced-media-options.ts"
            showLineNumbers
          />
        </section>

        <section className="bg-green-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">✨ Best Practices</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• <strong>Privacy First:</strong> Always respect user privacy and obtain consent</li>
            <li>• <strong>Multiple Sources:</strong> Combine different media types for accuracy</li>
            <li>• <strong>Context Matters:</strong> Provide domain hints for better results</li>
            <li>• <strong>Validate Results:</strong> Cross-reference with known demographics</li>
            <li>• <strong>Batch Processing:</strong> Use batch methods for efficiency</li>
          </ul>
        </section>
      </div>
    ),
  },
  'real-world-examples': {
    title: 'Real-World Examples',
    content: (
      <div className="space-y-8">
        <p className="text-xl text-gray-600 leading-relaxed">
          Explore practical applications of the Persona SDK across various domains. From predicting click-through rates to simulating voting behavior, these examples demonstrate the power of AI-driven persona generation.
        </p>
        
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">CTR Prediction for Marketing</h2>
          <p className="text-gray-600 mb-4">Model audience segments and predict click-through rates for marketing campaigns:</p>
          <CodeBlock 
            code={`import { PersonaGroup, PersonaBuilder } from '@jamesaphoenix/persona-sdk';
import { z } from 'zod';

// Create target audience for a fitness app campaign
const audience = new PersonaGroup('Fitness App Target Audience');

// Generate diverse audience with correlations
await audience.generateWithCorrelations(1000, {
  attributes: {
    age: new NormalDistribution(32, 8),
    income: new NormalDistribution(65000, 20000),
    fitnessLevel: new CategoricalDistribution([
      { value: 'beginner', probability: 0.3 },
      { value: 'intermediate', probability: 0.5 },
      { value: 'advanced', probability: 0.2 }
    ]),
    deviceType: new CategoricalDistribution([
      { value: 'iOS', probability: 0.45 },
      { value: 'Android', probability: 0.55 }
    ])
  },
  correlations: [
    { attribute1: 'age', attribute2: 'income', correlation: 0.4 },
    { attribute1: 'fitnessLevel', attribute2: 'income', correlation: 0.3 }
  ]
});

// Define CTR prediction schema
const CTRPredictionSchema = z.object({
  overallCTR: z.number().describe('Expected CTR as percentage'),
  segmentCTRs: z.array(z.object({
    segment: z.string(),
    criteria: z.string(),
    expectedCTR: z.number(),
    audienceSize: z.number()
  })),
  topPerformingAd: z.object({
    headline: z.string(),
    description: z.string(),
    targetSegment: z.string()
  }),
  recommendations: z.array(z.string())
});

// Generate CTR predictions
const predictions = await audience.generateStructuredOutput(
  CTRPredictionSchema,
  \`Analyze this audience for a fitness app marketing campaign. 
   The app costs $9.99/month and focuses on personalized workout plans.
   Predict CTR for different segments and recommend ad strategies.\`
);

console.log('Overall Expected CTR:', predictions.overallCTR + '%');
console.log('Top Segment:', predictions.segmentCTRs[0]);
console.log('Best Ad:', predictions.topPerformingAd);

// Test specific ad variations
const adVariations = [
  'Get Fit in 15 Minutes a Day',
  'Personalized Workouts for Your Goals',
  'Join 1M+ Users Getting Stronger'
];

for (const headline of adVariations) {
  const response = await audience.testCampaign(headline, {
    budget: 10000,
    duration: '7 days',
    targeting: { minAge: 25, maxAge: 45 }
  });
  
  console.log(\`"\${headline}": \${response.expectedCTR}% CTR\`);
}`}
            filename="ctr-prediction.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Engagement Analysis for Content</h2>
          <p className="text-gray-600 mb-4">Predict and analyze engagement for different content strategies:</p>
          <CodeBlock 
            code={`// Create audience for a tech blog
const techAudience = new PersonaGroup('Tech Blog Readers');

// Generate realistic tech audience
await techAudience.generateFromDistributions(500, {
  age: new NormalDistribution(28, 6),
  occupation: new CategoricalDistribution([
    { value: 'Software Engineer', probability: 0.4 },
    { value: 'Product Manager', probability: 0.2 },
    { value: 'Designer', probability: 0.15 },
    { value: 'Student', probability: 0.15 },
    { value: 'Other Tech', probability: 0.1 }
  ]),
  interests: new MultiCategoricalDistribution([
    { value: ['AI', 'Machine Learning'], probability: 0.6 },
    { value: ['Web Development'], probability: 0.5 },
    { value: ['Cloud Computing'], probability: 0.4 },
    { value: ['Blockchain'], probability: 0.3 },
    { value: ['Mobile Dev'], probability: 0.35 }
  ])
});

// Test different content hooks
const contentHooks = [
  {
    title: '10 AI Tools That Will 10x Your Productivity',
    category: 'AI',
    style: 'listicle'
  },
  {
    title: 'Why Rust is the Future of Systems Programming',
    category: 'Programming Languages',
    style: 'opinion'
  },
  {
    title: 'Building a $1M SaaS: My Journey',
    category: 'Entrepreneurship',
    style: 'case study'
  }
];

const EngagementSchema = z.object({
  expectedViews: z.number(),
  expectedComments: z.number(),
  expectedShares: z.number(),
  engagementRate: z.number(),
  audienceSegments: z.array(z.object({
    segment: z.string(),
    interest: z.number().min(0).max(10),
    likelihood: z.number().min(0).max(1)
  })),
  sentimentBreakdown: z.object({
    positive: z.number(),
    neutral: z.number(),
    negative: z.number()
  })
});

for (const content of contentHooks) {
  const engagement = await techAudience.generateStructuredOutput(
    EngagementSchema,
    \`Predict engagement metrics for this blog post:
     Title: \${content.title}
     Category: \${content.category}
     Style: \${content.style}
     
     Analyze expected views, comments, shares, and sentiment.\`
  );
  
  console.log(\`\\n"\${content.title}":\`);
  console.log(\`Expected Engagement Rate: \${engagement.engagementRate}%\`);
  console.log(\`Views: \${engagement.expectedViews}, Comments: \${engagement.expectedComments}\`);
  console.log(\`Top Interested Segment: \${engagement.audienceSegments[0].segment}\`);
}`}
            filename="engagement-analysis.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Voting & Polling Systems</h2>
          <p className="text-gray-600 mb-4">Simulate voting behavior and predict election outcomes:</p>
          <CodeBlock 
            code={`// Create a diverse voter population
const voterPopulation = new PersonaGroup('City Voters');

// Generate voters with realistic demographics
await voterPopulation.generateWithCorrelations(10000, {
  attributes: {
    age: new NormalDistribution(45, 15),
    income: new LogNormalDistribution(50000, 30000),
    education: new CategoricalDistribution([
      { value: 'High School', probability: 0.3 },
      { value: 'Bachelor', probability: 0.4 },
      { value: 'Graduate', probability: 0.3 }
    ]),
    politicalLeaning: new NormalDistribution(0, 1), // -2 (left) to +2 (right)
    district: new CategoricalDistribution([
      { value: 'Downtown', probability: 0.25 },
      { value: 'Suburbs', probability: 0.45 },
      { value: 'Rural', probability: 0.3 }
    ])
  },
  correlations: [
    { attribute1: 'age', attribute2: 'politicalLeaning', correlation: 0.3 },
    { attribute1: 'education', attribute2: 'income', correlation: 0.5 },
    { attribute1: 'district', attribute2: 'politicalLeaning', correlation: 0.4 }
  ]
});

// Define voting schema
const VotingResultSchema = z.object({
  results: z.array(z.object({
    candidate: z.string(),
    votePercentage: z.number(),
    voteCount: z.number()
  })),
  turnout: z.number(),
  demographicBreakdown: z.array(z.object({
    demographic: z.string(),
    turnoutRate: z.number(),
    candidatePreferences: z.record(z.number())
  })),
  swingFactors: z.array(z.string()),
  confidence: z.number()
});

// Simulate election
const candidates = [
  { name: 'Sarah Johnson', platform: 'Progressive', focus: 'Climate, Healthcare' },
  { name: 'Michael Chen', platform: 'Moderate', focus: 'Economy, Education' },
  { name: 'Robert Smith', platform: 'Conservative', focus: 'Taxes, Security' }
];

const electionResults = await voterPopulation.generateStructuredOutput(
  VotingResultSchema,
  \`Simulate a mayoral election with these candidates:
   \${candidates.map(c => \`\${c.name} (\${c.platform}): \${c.focus}\`).join('\\n')}
   
   Consider voter demographics, political leanings, and district preferences.
   Estimate turnout and breakdown by demographics.\`
);

console.log('Election Results:');
electionResults.results.forEach(r => {
  console.log(\`\${r.candidate}: \${r.votePercentage}% (\${r.voteCount} votes)\`);
});

console.log(\`\\nTurnout: \${electionResults.turnout}%\`);
console.log('Key Swing Factors:', electionResults.swingFactors);

// Run multiple simulations for confidence intervals
const simulations = [];
for (let i = 0; i < 100; i++) {
  const result = await voterPopulation.simulateElection(candidates);
  simulations.push(result);
}

// Calculate confidence intervals
const confidenceIntervals = calculateConfidenceIntervals(simulations);
console.log('95% Confidence Intervals:', confidenceIntervals);`}
            filename="voting-simulation.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Market Research Survey Simulation</h2>
          <p className="text-gray-600 mb-4">Generate statistically valid survey responses for market research:</p>
          <CodeBlock 
            code={`// Create target market for a new product
const targetMarket = new PersonaGroup('Smart Home Device Market');

// Generate diverse consumer base
await targetMarket.generateWithCorrelations(2000, {
  attributes: {
    age: new NormalDistribution(38, 12),
    householdIncome: new LogNormalDistribution(75000, 35000),
    techSavviness: new BetaDistribution(3, 2), // 0-1 scale, skewed high
    homeOwnership: new BernoulliDistribution(0.65),
    familySize: new PoissonDistribution(2.5),
    currentSmartDevices: new PoissonDistribution(3)
  },
  correlations: [
    { attribute1: 'age', attribute2: 'homeOwnership', correlation: 0.5 },
    { attribute1: 'householdIncome', attribute2: 'techSavviness', correlation: 0.4 },
    { attribute1: 'techSavviness', attribute2: 'currentSmartDevices', correlation: 0.7 }
  ]
});

// Define survey response schema
const SurveyResponseSchema = z.object({
  productInterest: z.object({
    veryInterested: z.number(),
    interested: z.number(),
    neutral: z.number(),
    notInterested: z.number()
  }),
  pricePoints: z.array(z.object({
    price: z.number(),
    willingToPay: z.number(),
    perceivesAsGoodValue: z.number()
  })),
  topFeatures: z.array(z.object({
    feature: z.string(),
    importance: z.number(),
    percentageWhoWant: z.number()
  })),
  purchaseTimeline: z.object({
    immediate: z.number(),
    within3Months: z.number(),
    within6Months: z.number(),
    withinYear: z.number(),
    noPlans: z.number()
  }),
  barriers: z.array(z.object({
    barrier: z.string(),
    percentageAffected: z.number()
  }))
});

// Run survey simulation
const surveyResults = await targetMarket.generateStructuredOutput(
  SurveyResponseSchema,
  \`Simulate survey responses for a new smart home security system:
   - AI-powered threat detection
   - Mobile app control
   - Professional monitoring option
   - Integration with existing smart home devices
   
   Test price points: $199, $299, $399
   Analyze interest, price sensitivity, desired features, and purchase barriers.\`
);

console.log('Product Interest:');
console.log(\`Very Interested: \${surveyResults.productInterest.veryInterested}%\`);
console.log(\`Interested: \${surveyResults.productInterest.interested}%\`);

console.log('\\nPrice Sensitivity:');
surveyResults.pricePoints.forEach(pp => {
  console.log(\`$\${pp.price}: \${pp.willingToPay}% willing to pay\`);
});

console.log('\\nTop Desired Features:');
surveyResults.topFeatures.slice(0, 5).forEach((f, i) => {
  console.log(\`\${i + 1}. \${f.feature} (importance: \${f.importance}/10)\`);
});

// Generate individual responses for deeper analysis
const individualResponses = await targetMarket.generateSurveyResponses({
  questions: [
    'How likely are you to purchase this product?',
    'What is your main concern about smart home security?',
    'What would make you choose our product over competitors?'
  ],
  responseFormat: 'detailed',
  sampleSize: 500
});

// Analyze correlations in responses
const correlationAnalysis = analyzeResponseCorrelations(individualResponses);
console.log('\\nKey Insights:', correlationAnalysis.insights);`}
            filename="survey-simulation.ts"
            showLineNumbers
          />
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">🎯 Use Cases</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• A/B Testing Simulation</li>
              <li>• Customer Segmentation</li>
              <li>• Product-Market Fit Analysis</li>
              <li>• Sentiment Prediction</li>
              <li>• User Journey Mapping</li>
              <li>• Conversion Optimization</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">📊 Benefits</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Reduce research costs</li>
              <li>• Faster insights generation</li>
              <li>• Test edge cases safely</li>
              <li>• Validate hypotheses</li>
              <li>• Scale analysis instantly</li>
              <li>• Reproducible results</li>
            </ul>
          </div>
        </section>

        <section className="bg-yellow-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Integration Tips</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• <strong>Start Small:</strong> Test with 100-500 personas before scaling up</li>
            <li>• <strong>Validate Assumptions:</strong> Compare results with real data when available</li>
            <li>• <strong>Use Correlations:</strong> Model realistic relationships between attributes</li>
            <li>• <strong>Iterate:</strong> Refine your models based on outcomes</li>
            <li>• <strong>Document:</strong> Keep track of your distribution parameters and assumptions</li>
          </ul>
        </section>
      </div>
    ),
  },
  'prompt-optimization': {
    title: 'Prompt Optimization',
    content: (
      <div className="space-y-8">
        <p className="text-xl text-gray-600 leading-relaxed">
          Automatically optimize your AI prompts for better persona generation. The SDK includes tools to test, refine, and improve prompts based on real results, ensuring consistently high-quality persona outputs.
        </p>
        
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Automatic Optimization</h2>
          <p className="text-gray-600 mb-4">Let the SDK optimize your prompts automatically:</p>
          <CodeBlock 
            code={`import { PromptOptimizer, PersonaBuilder } from '@jamesaphoenix/persona-sdk';

// Initialize optimizer
const optimizer = new PromptOptimizer({
  apiKey: process.env.OPENAI_API_KEY,
  objective: 'diversity', // or 'accuracy', 'consistency'
  model: 'gpt-4'
});

// Start with a basic prompt
const initialPrompt = 'Create a software developer persona';

// Optimize the prompt
const optimizedPrompt = await optimizer.optimize(initialPrompt, {
  iterations: 5,
  samplesPerIteration: 10,
  metrics: ['diversity', 'realism', 'completeness'],
  targetAttributes: ['age', 'skills', 'experience', 'personality']
});

console.log('Original prompt:', initialPrompt);
console.log('Optimized prompt:', optimizedPrompt.text);
console.log('Improvement:', optimizedPrompt.improvement);

// Results:
// Original: "Create a software developer persona"
// Optimized: "Create a detailed persona of a software developer 
//   including their age (20-50), technical skills, years of 
//   experience, personality traits, work preferences, and 
//   career goals. Make them realistic and diverse."
// Improvement: 78% better diversity, 65% more complete

// Use the optimized prompt
const persona = await PersonaBuilder.fromPrompt(
  optimizedPrompt.text,
  { apiKey: process.env.OPENAI_API_KEY }
);`}
            filename="auto-optimization.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">A/B Testing Prompts</h2>
          <p className="text-gray-600 mb-4">Test different prompt variations to find what works best:</p>
          <CodeBlock 
            code={`import { PromptTester } from '@jamesaphoenix/persona-sdk';

const tester = new PromptTester({
  apiKey: process.env.OPENAI_API_KEY
});

// Define prompt variations
const prompts = [
  {
    id: 'detailed',
    text: 'Generate a persona with age, occupation, hobbies, personality'
  },
  {
    id: 'narrative',
    text: 'Tell me about a person including their background and interests'
  },
  {
    id: 'structured',
    text: 'Create persona: Demographics, Professional info, Personal traits'
  }
];

// Run A/B test
const results = await tester.abTest(prompts, {
  samplesPerPrompt: 50,
  metrics: {
    completeness: (persona) => {
      const fields = ['age', 'occupation', 'hobbies', 'personality'];
      return fields.filter(f => persona.attributes[f]).length / fields.length;
    },
    diversity: (personas) => {
      // Calculate diversity score across all generated personas
      return calculateDiversityScore(personas);
    },
    consistency: (personas) => {
      // Check if similar prompts generate similar personas
      return calculateConsistencyScore(personas);
    }
  }
});

// Analyze results
console.log('A/B Test Results:');
results.forEach(result => {
  console.log(\`Prompt "\${result.id}":\`);
  console.log(\`  Completeness: \${result.metrics.completeness.toFixed(2)}\`);
  console.log(\`  Diversity: \${result.metrics.diversity.toFixed(2)}\`);
  console.log(\`  Consistency: \${result.metrics.consistency.toFixed(2)}\`);
  console.log(\`  Overall Score: \${result.overallScore.toFixed(2)}\`);
});

// Use the winning prompt
const winner = results.reduce((a, b) => 
  a.overallScore > b.overallScore ? a : b
);

console.log(\`\\nWinning prompt: "\${winner.prompt.text}"\`);`}
            filename="ab-testing.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Bootstrap Learning</h2>
          <p className="text-gray-600 mb-4">Train the optimizer with your own examples:</p>
          <CodeBlock 
            code={`import { PromptOptimizer } from '@jamesaphoenix/persona-sdk';

const optimizer = new PromptOptimizer({
  apiKey: process.env.OPENAI_API_KEY
});

// Provide example personas you want to generate
const goodExamples = [
  {
    name: 'Sarah Chen',
    age: 28,
    occupation: 'UX Designer',
    personality: 'creative, detail-oriented, empathetic',
    hobbies: ['digital art', 'user research', 'hiking'],
    background: 'Studied HCI, worked at 2 startups'
  },
  // ... more examples
];

// Train the optimizer
await optimizer.bootstrap({
  examples: goodExamples,
  
  // What makes these examples good?
  criteria: [
    'Complete demographic information',
    'Realistic personality traits',
    'Diverse backgrounds',
    'Professional details included'
  ],
  
  // Learn patterns from examples
  learnPatterns: true
});

// Generate new prompts based on learned patterns
const prompt = optimizer.generatePrompt({
  similarTo: goodExamples,
  emphasize: ['personality', 'background'],
  avoid: ['generic descriptions', 'missing details']
});

console.log('Generated prompt:', prompt);
// "Create a detailed persona including full name, age (20-40), 
//  specific occupation with industry context, 3-5 personality 
//  traits that influence their work style, hobbies that reflect 
//  their interests, and a brief professional background with 
//  education and career progression."`}
            filename="bootstrap-learning.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Prompt Templates</h2>
          <p className="text-gray-600 mb-4">Use and customize proven prompt templates:</p>
          <CodeBlock 
            code={`import { PromptTemplates } from '@jamesaphoenix/persona-sdk';

// Built-in templates for common use cases
const templates = PromptTemplates.getAll();

// Marketing persona template
const marketingPersona = await PersonaBuilder.fromPrompt(
  PromptTemplates.marketing({
    product: 'fitness app',
    targetAge: [25, 40],
    includeInterests: true,
    includePainPoints: true
  }),
  { apiKey: process.env.OPENAI_API_KEY }
);

// User research template
const researchPersona = await PersonaBuilder.fromPrompt(
  PromptTemplates.userResearch({
    domain: 'e-commerce',
    userType: 'frequent shopper',
    includeJourney: true,
    includeFrustrations: true
  }),
  { apiKey: process.env.OPENAI_API_KEY }
);

// Custom template with variables
const customTemplate = PromptTemplates.create({
  name: 'startup-employee',
  template: \`Create a persona for a {{role}} at a {{stage}} startup:
    - Age range: {{ageMin}}-{{ageMax}}
    - Experience level: {{experience}}
    - Key motivations for joining a startup
    - Work style and preferences
    - Career goals and aspirations
    - Technical skills if applicable\`,
  defaults: {
    stage: 'series-A',
    ageMin: 25,
    ageMax: 40,
    experience: 'mid-level'
  }
});

// Use custom template
const startupPersona = await PersonaBuilder.fromPrompt(
  customTemplate.render({
    role: 'frontend engineer',
    stage: 'seed',
    experience: 'senior'
  }),
  { apiKey: process.env.OPENAI_API_KEY }
);`}
            filename="prompt-templates.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Evaluation Metrics</h2>
          <p className="text-gray-600 mb-4">Measure and improve prompt quality:</p>
          <CodeBlock 
            code={`import { PromptEvaluator } from '@jamesaphoenix/persona-sdk';

const evaluator = new PromptEvaluator();

// Evaluate a single prompt
const prompt = 'Create a detailed marketing persona for our SaaS product';
const evaluation = await evaluator.evaluate(prompt, {
  samples: 20,
  metrics: [
    'completeness',   // Are all expected fields present?
    'consistency',    // Are results consistent across runs?
    'diversity',      // Is there good variety in outputs?
    'realism',        // Do personas seem realistic?
    'relevance',      // Are personas relevant to the context?
    'specificity'     // Are details specific vs generic?
  ]
});

console.log('Prompt Evaluation:');
console.log(\`Completeness: \${evaluation.completeness}/10\`);
console.log(\`Consistency: \${evaluation.consistency}/10\`);
console.log(\`Diversity: \${evaluation.diversity}/10\`);
console.log(\`Overall Quality: \${evaluation.overall}/10\`);

// Get specific recommendations
const recommendations = evaluator.recommend(evaluation);
console.log('\\nRecommendations:');
recommendations.forEach(rec => {
  console.log(\`- \${rec.issue}: \${rec.suggestion}\`);
});

// Example output:
// Recommendations:
// - Low specificity: Add more specific attributes like "age range 25-45"
// - Missing context: Include industry or product details
// - Generic output: Request unique personality traits or backgrounds

// Track improvement over time
const history = await evaluator.trackProgress([
  { prompt: initialPrompt, timestamp: new Date('2024-01-01') },
  { prompt: improvedPrompt, timestamp: new Date('2024-01-15') },
  { prompt: optimizedPrompt, timestamp: new Date('2024-02-01') }
]);

// Visualize improvement
console.log('Quality improvement over time:');
history.forEach(entry => {
  console.log(\`\${entry.date}: \${entry.quality}/10 (\${entry.change})\`);
});`}
            filename="evaluation-metrics.ts"
            showLineNumbers
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Chain-of-Thought Prompting</h2>
          <p className="text-gray-600 mb-4">Use advanced prompting techniques for complex personas:</p>
          <CodeBlock 
            code={`import { ChainPromptBuilder } from '@jamesaphoenix/persona-sdk';

// Build complex personas step by step
const chain = new ChainPromptBuilder();

const complexPersona = await chain
  // Step 1: Basic demographics
  .addStep('Generate basic demographics for a tech professional')
  
  // Step 2: Enrich with context
  .addStep((previous) => 
    \`Given these demographics: \${JSON.stringify(previous)},
     add relevant professional background and career trajectory\`
  )
  
  // Step 3: Add personality based on background
  .addStep((previous) =>
    \`Based on this person's background: \${JSON.stringify(previous)},
     infer personality traits, work style, and motivations\`
  )
  
  // Step 4: Generate realistic challenges
  .addStep((previous) =>
    \`What challenges might this person face: \${JSON.stringify(previous)}?
     Include professional, personal, and industry-specific challenges\`
  )
  
  // Execute the chain
  .execute({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    mergeStrategy: 'deep' // Merge all steps into final persona
  });

console.log('Complex persona:', complexPersona);

// Conditional chains based on initial output
const conditionalChain = chain
  .addStep('Generate a professional persona')
  .addConditionalStep({
    condition: (persona) => persona.age < 30,
    prompt: 'Add early career challenges and learning goals',
    else: 'Add leadership experience and mentoring interests'
  })
  .addConditionalStep({
    condition: (persona) => persona.occupation.includes('Engineer'),
    prompt: 'Add technical skills and project experience',
    else: 'Add domain expertise and industry knowledge'
  });`}
            filename="chain-prompting.ts"
            showLineNumbers
          />
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-purple-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">🎯 Optimization Strategies</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Start with simple prompts and iterate</li>
              <li>• Use specific examples in prompts</li>
              <li>• Define clear success metrics</li>
              <li>• Test with diverse scenarios</li>
              <li>• Track performance over time</li>
              <li>• Learn from generated outputs</li>
            </ul>
          </div>
          <div className="bg-orange-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">⚡ Performance Tips</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Cache optimized prompts</li>
              <li>• Batch similar requests</li>
              <li>• Use smaller models for testing</li>
              <li>• Implement retry logic</li>
              <li>• Monitor API costs</li>
              <li>• Set reasonable timeouts</li>
            </ul>
          </div>
        </section>

        <section className="bg-green-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 Advanced Techniques</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• <strong>Few-shot learning:</strong> Provide examples in prompts for better results</li>
            <li>• <strong>Temperature tuning:</strong> Adjust randomness for diversity vs consistency</li>
            <li>• <strong>Prompt chaining:</strong> Build complex personas incrementally</li>
            <li>• <strong>Negative prompting:</strong> Specify what to avoid in outputs</li>
            <li>• <strong>Meta-prompting:</strong> Use AI to generate better prompts</li>
          </ul>
        </section>
      </div>
    ),
  },
};

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const pageName = slug?.join('/') || 'index';
  const page = pageContent[pageName];
  
  if (!page) {
    notFound();
  }
  
  // Get current page index for navigation
  const currentIndex = navigation.findIndex(item => item.href === `/docs${slug ? '/' + slug.join('/') : ''}`);
  const previousPage = currentIndex > 0 ? navigation[currentIndex - 1] : null;
  const nextPage = currentIndex < navigation.length - 1 ? navigation[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Mobile Navigation */}
      <MobileNavigation 
        navigation={navigation}
        currentPath={`/docs${slug ? '/' + slug.join('/') : ''}`}
      />

      <div className="lg:max-w-screen-xl lg:mx-auto lg:flex">

        {/* Desktop Left Sidebar Navigation */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-[var(--border)] py-8 px-6 sticky top-0 h-screen overflow-y-auto">
          <Link href="/" className="font-semibold text-lg mb-8 block">
            Persona SDK
          </Link>
          
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = item.href === `/docs${slug ? '/' + slug.join('/') : ''}`;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block py-1 text-sm ${
                    isActive 
                      ? 'text-[var(--accent)] font-medium' 
                      : 'text-[var(--muted)] hover:text-[var(--fg)]'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="mt-8 pt-8 border-t border-[var(--border)]">
            <div className="space-y-2">
              <a href="https://github.com/jamesaphoenix/persona-sdk" className="text-sm flex items-center gap-2 text-[var(--muted)] hover:text-[var(--fg)]">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"/>
                </svg>
                GitHub
              </a>
              <a href="https://www.npmjs.com/package/@jamesaphoenix/persona-sdk" className="text-sm flex items-center gap-2 text-[var(--muted)] hover:text-[var(--fg)]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331z"/>
                </svg>
                npm
              </a>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-12 py-8 pt-16 lg:pt-8 max-w-4xl">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{page.title}</h1>
          <div id="main-content">
            {page.content}
          </div>
          
          {/* Previous/Next Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-16 pt-8 border-t border-[var(--border)]">
            <div>
              {previousPage && (
                <Link href={previousPage.href} className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--fg)]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <div>
                    <div className="text-xs text-[var(--muted)]">Previous</div>
                    <div className="text-sm font-medium">{previousPage.name}</div>
                  </div>
                </Link>
              )}
            </div>
            <div className="sm:text-right">
              {nextPage && (
                <Link href={nextPage.href} className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--fg)]">
                  <div className="text-right">
                    <div className="text-xs text-[var(--muted)]">Next</div>
                    <div className="text-sm font-medium">{nextPage.name}</div>
                  </div>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </main>
        
        {/* Right Sidebar - Table of Contents (Desktop only) */}
        <aside className="hidden xl:block w-64 shrink-0 pl-8 py-8 sticky top-0 h-screen overflow-y-auto">
          <div className="text-sm font-medium text-[var(--fg)] mb-4">On this page</div>
          <TableOfContents />
        </aside>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return [
    { slug: [] },
    { slug: ['quick-start'] },
    { slug: ['persona'] },
    { slug: ['persona-builder'] },
    { slug: ['persona-group'] },
    { slug: ['distributions'] },
    { slug: ['correlations'] },
    { slug: ['ai'] },
    { slug: ['media-to-persona'] },
    { slug: ['real-world-examples'] },
    { slug: ['prompt-optimization'] },
    { slug: ['advanced'] },
    { slug: ['api'] },
  ];
}