import Link from 'next/link';

export default function PersonaBuilderPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>← Back to Docs</Link>
      
      <h1>PersonaBuilder Class</h1>
      
      <h2>Overview</h2>
      <p>Fluent builder pattern for creating personas.</p>

      <h2>Static Methods</h2>
      
      <h3>create(): PersonaBuilder</h3>
      <p>Create a new builder instance.</p>

      <h3>fromPrompt(prompt: string, options: {`{ apiKey: string }`}): Promise&lt;Persona&gt;</h3>
      <p>Generate a persona from natural language prompt using AI.</p>

      <h2>Instance Methods</h2>

      <h3>setName(name: string): PersonaBuilder</h3>
      <p>Set the persona's name.</p>

      <h3>setAge(age: number | Distribution): PersonaBuilder</h3>
      <p>Set age using a value or distribution.</p>

      <h3>setOccupation(occupation: string | Distribution): PersonaBuilder</h3>
      <p>Set occupation using a value or distribution.</p>

      <h3>setSex(sex: Sex | Distribution): PersonaBuilder</h3>
      <p>Set gender using a value or distribution.</p>

      <h3>setCustomAttribute(key: string, value: any): PersonaBuilder</h3>
      <p>Add a custom attribute.</p>

      <h3>build(): Persona</h3>
      <p>Build and return the persona.</p>

      <h3>buildMany(count: number, baseName?: string): Persona[]</h3>
      <p>Build multiple personas.</p>

      <h2>Example</h2>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
{`// Simple persona
const persona = PersonaBuilder.create()
  .setName('Alice')
  .setAge(25)
  .setOccupation('Designer')
  .setSex('female')
  .build();

// Using distributions
const randomPersona = PersonaBuilder.create()
  .setName('Random User')
  .setAge(new NormalDistribution(30, 5))
  .setOccupation(new CategoricalDistribution([
    { value: 'Developer', probability: 0.6 },
    { value: 'Designer', probability: 0.4 }
  ]))
  .build();`}
      </pre>
    </div>
  );
}