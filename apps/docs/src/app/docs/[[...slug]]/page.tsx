import { notFound } from 'next/navigation';
import Link from 'next/link';

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
      <>
        <p className="text-lg text-gray-700 mb-6">
          The Persona SDK is a powerful TypeScript library for generating realistic personas using statistical distributions and AI.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Installation</h2>
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6 overflow-x-auto">
          <code className="text-sm">npm install @jamesaphoenix/persona-sdk</code>
        </div>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Quick Start</h2>
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6 overflow-x-auto">
          <pre className="text-sm"><code>{`import { Persona, PersonaBuilder } from '@jamesaphoenix/persona-sdk';

// Create a persona using the builder pattern
const persona = PersonaBuilder.create()
  .setName('Alex')
  .setAge(28)
  .setOccupation('Developer')
  .build();

console.log(persona.toObject());`}</code></pre>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Key Features</h2>
        <ul className="space-y-2 list-disc list-inside text-gray-700">
          <li>🎲 Statistical distribution-based generation</li>
          <li>🤖 AI-powered persona creation</li>
          <li>👥 PersonaGroup management</li>
          <li>📊 Realistic attribute correlations</li>
          <li>🔄 Seedable random generation</li>
          <li>⚡ TypeScript-first with full type safety</li>
        </ul>
      </>
    ),
  },
  persona: {
    title: 'Persona Class',
    content: (
      <>
        <p className="text-lg text-gray-700 mb-6">
          The Persona class represents an individual with various attributes like age, occupation, and custom properties.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Basic Usage</h2>
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6 overflow-x-auto">
          <pre className="text-sm"><code>{`// Direct instantiation
const persona = new Persona('John Doe', {
  age: 30,
  occupation: 'Engineer',
  sex: 'male',
  income: 75000
});

// Access properties
console.log(persona.name);       // 'John Doe'
console.log(persona.age);        // 30
console.log(persona.occupation); // 'Engineer'`}</code></pre>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Builder Pattern</h2>
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6 overflow-x-auto">
          <pre className="text-sm"><code>{`const persona = PersonaBuilder.create()
  .setName('Jane Smith')
  .setAge(25)
  .setOccupation('Designer')
  .setSex('female')
  .setCustom('skills', ['UI/UX', 'Prototyping'])
  .build();`}</code></pre>
        </div>
      </>
    ),
  },
  'persona-group': {
    title: 'PersonaGroup',
    content: (
      <>
        <p className="text-lg text-gray-700 mb-6">
          PersonaGroup allows you to manage collections of personas and perform group operations.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Creating Groups</h2>
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6 overflow-x-auto">
          <pre className="text-sm"><code>{`const group = new PersonaGroup('Marketing Audience');

// Add personas
group.add(new Persona('Alice', { age: 25, occupation: 'Designer' }));
group.add(new Persona('Bob', { age: 30, occupation: 'Developer' }));

// Generate from distributions
group.generateFromDistributions(100, {
  age: new NormalDistribution(30, 5),
  occupation: new CategoricalDistribution([
    { value: 'Developer', probability: 0.6 },
    { value: 'Manager', probability: 0.4 }
  ])
});`}</code></pre>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Group Statistics</h2>
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6 overflow-x-auto">
          <pre className="text-sm"><code>{`const stats = group.getStatistics('age');
console.log(\`Average age: \${stats.mean}\`);
console.log(\`Age range: \${stats.min} - \${stats.max}\`);`}</code></pre>
        </div>
      </>
    ),
  },
  distributions: {
    title: 'Statistical Distributions',
    content: (
      <>
        <p className="text-lg text-gray-700 mb-6">
          The SDK provides various statistical distributions for generating realistic persona attributes.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Available Distributions</h2>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">Normal Distribution</h3>
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6 overflow-x-auto">
          <pre className="text-sm"><code>{`const age = new NormalDistribution(35, 10);
const sample = age.sample(); // e.g., 32.5`}</code></pre>
        </div>

        <h3 className="text-xl font-semibold mt-6 mb-3">Uniform Distribution</h3>
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6 overflow-x-auto">
          <pre className="text-sm"><code>{`const income = new UniformDistribution(40000, 120000);
const sample = income.sample(); // e.g., 75432`}</code></pre>
        </div>

        <h3 className="text-xl font-semibold mt-6 mb-3">Categorical Distribution</h3>
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6 overflow-x-auto">
          <pre className="text-sm"><code>{`const occupation = new CategoricalDistribution([
  { value: 'Engineer', probability: 0.4 },
  { value: 'Designer', probability: 0.3 },
  { value: 'Manager', probability: 0.3 }
]);
const sample = occupation.sample(); // e.g., 'Engineer'`}</code></pre>
        </div>
      </>
    ),
  },
  ai: {
    title: 'AI-Powered Features',
    content: (
      <>
        <p className="text-lg text-gray-700 mb-6">
          Leverage AI to create personas from natural language prompts and generate structured insights.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Create from Prompt</h2>
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6 overflow-x-auto">
          <pre className="text-sm"><code>{`const persona = await PersonaBuilder.fromPrompt(
  'Create a 25-year-old software developer who enjoys gaming',
  { apiKey: process.env.OPENAI_API_KEY }
);`}</code></pre>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Structured Output</h2>
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6 overflow-x-auto">
          <pre className="text-sm"><code>{`import { z } from 'zod';

const MarketInsightSchema = z.object({
  targetSegment: z.string(),
  topInterests: z.array(z.string()),
  recommendations: z.array(z.string())
});

const insights = await group.generateStructuredOutput(
  MarketInsightSchema,
  'Analyze this audience for marketing'
);`}</code></pre>
        </div>
      </>
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
      <nav className="w-64 bg-gray-50 border-r border-gray-200 pt-8 px-4 fixed h-full overflow-y-auto">
        <div className="mb-8">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600">
            🧬 Persona SDK
          </Link>
        </div>
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = item.href === `/docs${slug ? '/' + slug.join('/') : ''}`;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">{page.title}</h1>
          <div className="prose prose-lg max-w-none">
            {page.content}
          </div>
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