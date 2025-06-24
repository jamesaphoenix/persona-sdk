import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';

const navigation = [
  { name: 'Introduction', href: '/docs' },
  { name: 'Quick Start', href: '/docs/quick-start' },
  { name: 'Persona', href: '/docs/persona' },
  { name: 'PersonaBuilder', href: '/docs/persona-builder' },
  { name: 'PersonaGroup', href: '/docs/persona-group' },
  { name: 'Distributions', href: '/docs/distributions' },
  { name: 'Correlations', href: '/docs/correlations' },
  { name: 'AI Features', href: '/docs/ai' },
  { name: 'Advanced Usage', href: '/docs/advanced' },
  { name: 'API Reference', href: '/docs/api' },
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
              <li>• Batch generate for large datasets (>1000 personas)</li>
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
    { slug: ['quick-start'] },
    { slug: ['persona'] },
    { slug: ['persona-builder'] },
    { slug: ['persona-group'] },
    { slug: ['distributions'] },
    { slug: ['correlations'] },
    { slug: ['ai'] },
    { slug: ['advanced'] },
    { slug: ['api'] },
  ];
}