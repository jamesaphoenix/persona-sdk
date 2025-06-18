import Link from 'next/link';
import { Button } from 'fumadocs-ui/components/button';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Persona SDK
            </h1>
            <p className="text-xl text-muted-foreground">
              AI-powered persona generation with integrated prompt optimization
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2 rounded-lg border p-6">
              <h3 className="text-xl font-semibold">🎯 Persona Generation</h3>
              <p className="text-muted-foreground">
                Generate realistic personas using statistical distributions and AI
              </p>
            </div>
            
            <div className="space-y-2 rounded-lg border p-6">
              <h3 className="text-xl font-semibold">🚀 Prompt Optimization</h3>
              <p className="text-muted-foreground">
                Optimize prompts using DSPy-inspired techniques for better AI performance
              </p>
            </div>
            
            <div className="space-y-2 rounded-lg border p-6">
              <h3 className="text-xl font-semibold">📊 Statistical Tools</h3>
              <p className="text-muted-foreground">
                Advanced distributions with correlations and conditional dependencies
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/docs">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="https://github.com/jamesaphoenix/persona-sdk">
              <Button size="lg" variant="outline">
                View on GitHub
              </Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Quick Start</h2>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4">
              <code>{`npm install @jamesaphoenix/persona-sdk

// Generate personas
import { PersonaBuilder, NormalDistribution } from '@jamesaphoenix/persona-sdk';

const persona = PersonaBuilder.create()
  .withName('Alice Johnson')
  .withAge(28)
  .withOccupation('Software Engineer')
  .withSex('female')
  .build();

// Optimize prompts
import { BootstrapOptimizer } from '@jamesaphoenix/persona-sdk/prompt-optimizer';

const optimizer = new BootstrapOptimizer({
  maxLabeled: 10,
  metric: ExactMatch
});`}</code>
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}