import Link from 'next/link';

export default function AIPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>← Back to Docs</Link>
      
      <h1>AI Features</h1>
      
      <h2>PersonaAI</h2>
      <p>Static methods for AI-powered persona generation.</p>

      <h3>generateMultiple</h3>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
{`static async generateMultiple(options: {
  prompt: string;
  count: number;
  apiKey: string;
}): Promise<Persona[]>`}
      </pre>

      <h3>optimizePrompt</h3>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
{`static async optimizePrompt(options: {
  originalPrompt: string;
  goal: string;
  apiKey: string;
}): Promise<string>`}
      </pre>

      <h2>DistributionSelector</h2>
      <p>Intelligent distribution selection.</p>

      <h3>selectForAttribute</h3>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
{`static async selectForAttribute(options: {
  attribute: string;
  context?: string;
  apiKey: string;
}): Promise<BaseDistribution>`}
      </pre>

      <h2>StructuredOutputGenerator</h2>
      <p>Generate structured data with validation.</p>

      <h3>generate</h3>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
{`static async generate<T>(options: {
  prompt: string;
  schema: ZodSchema<T>;
  apiKey: string;
}): Promise<T>`}
      </pre>

      <h2>Examples</h2>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
{`// Generate multiple personas
const personas = await PersonaAI.generateMultiple({
  prompt: 'Create diverse personas for a fitness app',
  count: 5,
  apiKey: process.env.OPENAI_API_KEY
});

// Structured output
import { z } from 'zod';

const MarketAnalysisSchema = z.object({
  targetAge: z.string(),
  interests: z.array(z.string()),
  painPoints: z.array(z.string())
});

const analysis = await StructuredOutputGenerator.generate({
  prompt: 'Analyze target market for productivity app',
  schema: MarketAnalysisSchema,
  apiKey: process.env.OPENAI_API_KEY
});`}
      </pre>
    </div>
  );
}