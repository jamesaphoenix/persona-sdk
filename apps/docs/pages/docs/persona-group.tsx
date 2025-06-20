import Link from 'next/link';

export default function PersonaGroupPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>← Back to Docs</Link>
      
      <h1>PersonaGroup Class</h1>
      
      <h2>Overview</h2>
      <p>Manage collections of personas.</p>

      <h2>Constructor</h2>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
{`new PersonaGroup(options?: PersonaGroupOptions)`}
      </pre>

      <h2>Properties</h2>
      <ul>
        <li><code>size: number</code> - Number of personas in group</li>
      </ul>

      <h2>Methods</h2>

      <h3>add(persona: Persona): void</h3>
      <p>Add a persona to the group.</p>

      <h3>remove(persona: Persona): boolean</h3>
      <p>Remove a persona from the group. Returns true if removed.</p>

      <h3>getAll(): Persona[]</h3>
      <p>Get all personas in the group.</p>

      <h3>filter(predicate: (persona: Persona) =&gt; boolean): Persona[]</h3>
      <p>Filter personas by a condition.</p>

      <h3>findById(id: string): Persona | undefined</h3>
      <p>Find a persona by ID.</p>

      <h3>clear(): void</h3>
      <p>Remove all personas from the group.</p>

      <h3>toJSON(): PersonaData[]</h3>
      <p>Export all personas as JSON array.</p>

      <h2>Example</h2>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
{`const group = new PersonaGroup();

// Add personas
const persona1 = PersonaBuilder.create()
  .setName('Alice')
  .setAge(25)
  .build();

group.add(persona1);

// Filter by age
const youngPersonas = group.filter(p => p.age < 30);

// Export all
const data = group.toJSON();`}
      </pre>
    </div>
  );
}