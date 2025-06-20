import Link from 'next/link';

export default function PersonaPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>← Back to Docs</Link>
      
      <h1>Persona Class</h1>
      
      <h2>Overview</h2>
      <p>The Persona class represents an individual with attributes.</p>

      <h2>Constructor</h2>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
{`new Persona(name: string, attributes: PersonaAttributes)`}
      </pre>

      <h2>Properties</h2>
      <ul>
        <li><code>id: string</code> - Unique identifier</li>
        <li><code>name: string</code> - Persona name</li>
        <li><code>age: number</code> - Age</li>
        <li><code>occupation: string</code> - Occupation</li>
        <li><code>sex: Sex</code> - Gender</li>
      </ul>

      <h2>Methods</h2>
      
      <h3>getAttribute(key: string): any</h3>
      <p>Get a custom attribute value.</p>

      <h3>setAttribute(key: string, value: any): void</h3>
      <p>Set a custom attribute.</p>

      <h3>clone(newName?: string): Persona</h3>
      <p>Create a copy of the persona with optional new name.</p>

      <h3>toJSON(): PersonaData</h3>
      <p>Export persona data as JSON.</p>

      <h2>Example</h2>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
{`const persona = new Persona('John Doe', {
  age: 30,
  occupation: 'Engineer',
  sex: 'male'
});

// Set custom attributes
persona.setAttribute('location', 'New York');
persona.setAttribute('skills', ['JavaScript', 'Python']);

// Clone with new name
const clone = persona.clone('Jane Doe');

// Export as JSON
const data = persona.toJSON();`}
      </pre>
    </div>
  );
}