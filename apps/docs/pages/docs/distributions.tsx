import Link from 'next/link';

export default function DistributionsPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>← Back to Docs</Link>
      
      <h1>Statistical Distributions</h1>
      
      <h2>Base Distribution</h2>
      <p>All distributions extend the abstract BaseDistribution class:</p>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
{`abstract class BaseDistribution {
  abstract sample(): number;
  setSeed(seed: number): void;
}`}
      </pre>

      <h2>Normal Distribution</h2>
      <p>Bell curve distribution for continuous values.</p>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
{`new NormalDistribution(mean: number, standardDeviation: number)

// Example
const age = new NormalDistribution(35, 10);
const value = age.sample(); // e.g., 32.5`}
      </pre>

      <h2>Uniform Distribution</h2>
      <p>Equal probability across a range.</p>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
{`new UniformDistribution(min: number, max: number)

// Example
const salary = new UniformDistribution(30000, 100000);
const value = salary.sample(); // e.g., 65432`}
      </pre>

      <h2>Exponential Distribution</h2>
      <p>Models waiting times and rare events.</p>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
{`new ExponentialDistribution(rate: number)

// Example
const waitTime = new ExponentialDistribution(0.1);
const value = waitTime.sample(); // e.g., 8.3`}
      </pre>

      <h2>Categorical Distribution</h2>
      <p>Discrete values with probabilities.</p>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
{`new CategoricalDistribution(categories: Category[])

// Example
const occupation = new CategoricalDistribution([
  { value: 'Engineer', probability: 0.3 },
  { value: 'Designer', probability: 0.2 },
  { value: 'Manager', probability: 0.2 },
  { value: 'Analyst', probability: 0.3 }
]);

const job = occupation.sample(); // e.g., "Engineer"`}
      </pre>
    </div>
  );
}