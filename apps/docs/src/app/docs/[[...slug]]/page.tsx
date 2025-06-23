import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';

const navigation = [
  { name: 'Introduction', href: '/docs' },
  { name: 'Persona', href: '/docs/persona' },
  { name: 'PersonaGroup', href: '/docs/persona-group' },
  { name: 'Distributions', href: '/docs/distributions' },
  { name: 'AI Features', href: '/docs/ai' },
];

const pageContent: Record<string, { title: string; content: JSX.Element }> = {
  index: {
    title: 'Introduction',
    content: (
      <div className="space-y-8">
        <p className="text-xl text-gray-600 leading-relaxed">
          The Persona SDK is a powerful TypeScript library for generating realistic personas using statistical distributions and AI. Build rich, diverse datasets for testing, simulations, and analytics.
        </p>
        
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Installation</h2>
          <CodeBlock 
            code="npm install @jamesaphoenix/persona-sdk"
            language="bash"
          />
        </section>
        
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Quick Start</h2>
          <CodeBlock 
            code={`import { Persona, PersonaBuilder } from '@jamesaphoenix/persona-sdk';

// Create a persona using the builder pattern
const persona = PersonaBuilder.create()
  .setName('Alex')
  .setAge(28)
  .setOccupation('Developer')
  .build();

console.log(persona.toObject());`}
            filename="example.ts"
          />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-blue-50">
              <span className="text-2xl">🎲</span>
              <div>
                <h3 className="font-semibold text-gray-900">Statistical Distributions</h3>
                <p className="text-gray-600 text-sm mt-1">Generate realistic data with mathematical distributions</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-green-50">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-semibold text-gray-900">AI-Powered</h3>
                <p className="text-gray-600 text-sm mt-1">Create personas from natural language prompts</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-purple-50">
              <span className="text-2xl">👥</span>
              <div>
                <h3 className="font-semibold text-gray-900">Group Management</h3>
                <p className="text-gray-600 text-sm mt-1">Handle collections with statistical analysis</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-orange-50">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="font-semibold text-gray-900">Realistic Correlations</h3>
                <p className="text-gray-600 text-sm mt-1">Model real-world attribute relationships</p>
              </div>
            </div>
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

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">🎯 Key Methods</h3>
            <ul className="space-y-2 text-gray-700">
              <li><code className="bg-white px-2 py-1 rounded text-sm">add()</code> - Add a persona</li>
              <li><code className="bg-white px-2 py-1 rounded text-sm">remove()</code> - Remove by ID</li>
              <li><code className="bg-white px-2 py-1 rounded text-sm">filter()</code> - Filter personas</li>
              <li><code className="bg-white px-2 py-1 rounded text-sm">getStatistics()</code> - Get stats</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">📊 Properties</h3>
            <ul className="space-y-2 text-gray-700">
              <li><code className="bg-white px-2 py-1 rounded text-sm">size</code> - Number of personas</li>
              <li><code className="bg-white px-2 py-1 rounded text-sm">personas</code> - All personas array</li>
              <li><code className="bg-white px-2 py-1 rounded text-sm">name</code> - Group name</li>
            </ul>
          </div>
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

            {/* Additional Distributions */}
            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">More Distributions</h3>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">Exponential</h4>
                  <p className="text-sm text-gray-600 mt-1">Time between events, like customer arrivals</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">Beta</h4>
                  <p className="text-sm text-gray-600 mt-1">Probabilities and percentages</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">Poisson</h4>
                  <p className="text-sm text-gray-600 mt-1">Count of events in fixed time</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">Custom</h4>
                  <p className="text-sm text-gray-600 mt-1">Create your own distributions</p>
                </div>
              </div>
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

        <section className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">🚀 Advanced AI Features</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-lg mb-2">Distribution Selection</h4>
              <p className="text-gray-600">AI automatically selects the best statistical distribution for your data based on context.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Media-to-Persona</h4>
              <p className="text-gray-600">Generate personas from images, videos, or audio content analysis.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Focus Groups</h4>
              <p className="text-gray-600">Simulate focus group discussions with diverse persona perspectives.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">LangChain Integration</h4>
              <p className="text-gray-600">Build complex AI pipelines with LangChain compatibility.</p>
            </div>
          </div>
        </section>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-2">⚡ Performance Tip</h4>
          <p className="text-gray-700">Use environment variables for API keys and consider caching AI-generated personas to reduce API costs.</p>
        </div>
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
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <nav className="hidden lg:block w-72 bg-gray-50 border-r border-gray-200 pt-8 px-6 fixed h-full overflow-y-auto">
        <div className="mb-10">
          <Link href="/" className="flex items-center space-x-3 group">
            <span className="text-3xl group-hover:scale-110 transition-transform">🧬</span>
            <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Persona SDK</span>
          </Link>
        </div>
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Documentation</p>
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = item.href === `/docs${slug ? '/' + slug.join('/') : ''}`;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md transform scale-105'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:translate-x-1'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Resources</p>
          <ul className="space-y-2">
            <li>
              <a href="https://github.com/jamesaphoenix/persona-sdk" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"/>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://www.npmjs.com/package/@jamesaphoenix/persona-sdk" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331z"/>
                </svg>
                npm Package
              </a>
            </li>
          </ul>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-72 bg-white">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">{page.title}</h1>
          <div className="border-b-2 border-gray-200 mb-12 pb-4"></div>
          {page.content}
        </div>
      </main>
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