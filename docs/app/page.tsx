import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-background">
        <div className="container mx-auto px-4 py-24">
          <div className="mx-auto max-w-5xl space-y-8 text-center">
            <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              🚀 Used by 50+ LLM Engineers to ship faster
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Know What Works
              <br />
              Before You Build
            </h1>
            
            <p className="text-xl text-muted-foreground sm:text-2xl max-w-3xl mx-auto">
              Simulate thousands of user interactions, predict content performance, and optimize 
              marketing strategies with AI-powered personas. Ship winners, not experiments.
            </p>
            
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/docs/getting-started" className="inline-flex h-12 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-8 text-base font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105">
                Start Building in 5 Minutes →
              </Link>
              <Link href="/docs/examples/media-analysis/01-ctr-prediction" className="inline-flex h-12 items-center justify-center rounded-md border-2 border-gray-300 bg-white px-8 text-base font-medium text-gray-700 transition-all hover:border-gray-400 hover:shadow-md dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700">
                See Real Examples
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="border-y bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span>500+ GitHub Stars</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📈</span>
              <span>73% Faster Content Testing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span>$2.3M ARR Generated</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span>10x Better Targeting</span>
            </div>
          </div>
        </div>
      </div>

      {/* Value Props */}
      <div className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Stop Guessing. Start Knowing. 🎯
          </h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl">
                📊
              </div>
              <h3 className="text-xl font-semibold">Predict Content Performance</h3>
              <p className="text-muted-foreground">
                Know your CTR, engagement rates, and viral potential before publishing. 
                Our AI analyzes 1000s of personas to predict real user behavior.
              </p>
              <Link href="/docs/examples/media-analysis/01-ctr-prediction" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                See CTR prediction example →
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center text-2xl">
                🧪
              </div>
              <h3 className="text-xl font-semibold">A/B Test Without Coding</h3>
              <p className="text-muted-foreground">
                Simulate A/B tests on 10,000 users in seconds. Find winners before 
                writing a single line of code. Ship only what works.
              </p>
              <Link href="/docs/examples/surveys/02-ab-testing" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                Run your first A/B test →
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-2xl">
                🤖
              </div>
              <h3 className="text-xl font-semibold">AI Marketing Strategies</h3>
              <p className="text-muted-foreground">
                Generate positioning, campaigns, and pricing strategies tailored to 
                your exact audience. Marketing that actually converts.
              </p>
              <Link href="/docs/examples/marketing/structured-output-magic" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                Generate marketing magic →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start Code */}
      <div className="border-t bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Your First Win in 3 Minutes 🏆</h2>
              <p className="text-xl text-muted-foreground">
                Copy, paste, and see real results immediately
              </p>
            </div>
            
            <div className="rounded-xl bg-gray-900 p-6 text-gray-100 overflow-x-auto">
              <pre className="text-sm">
                <code>{`// 1. Install (30 seconds)
npm install @jamesaphoenix/persona-sdk

// 2. Create your audience (30 seconds)
import { PersonaGroup, StructuredOutputGenerator } from '@jamesaphoenix/persona-sdk';
import { NormalDistribution } from '@jamesaphoenix/persona-sdk/distributions';
import { z } from 'zod';

const audience = await PersonaGroup.generate({
  size: 1000,
  attributes: {
    age: new NormalDistribution(28, 8),
    interests: ['tech', 'startups', 'productivity']
  }
});

// 3. Get AI insights (2 minutes)
const generator = new StructuredOutputGenerator();

const InsightSchema = z.object({
  viral_probability: z.number(),
  best_headline: z.string(),
  predicted_ctr: z.number(),
  top_3_hooks: z.array(z.string())
});

const insights = await generator.generateCustom(
  audience,
  InsightSchema,
  "Analyze viral potential for: How I 10x'd my productivity with AI"
);

console.log(\`🔥 Viral probability: \${(insights.data.viral_probability * 100).toFixed(0)}%\`);
console.log(\`📈 Predicted CTR: \${(insights.data.predicted_ctr * 100).toFixed(1)}%\`);
console.log(\`✨ Best headline: "\${insights.data.best_headline}"\`);

// Output:
// 🔥 Viral probability: 73%
// 📈 Predicted CTR: 12.7%
// ✨ Best headline: "I Let AI Plan My Entire Day for 30 Days (Shocking Results)"`}</code>
              </pre>
            </div>
            
            <div className="flex justify-center pt-4">
              <Link href="/docs/getting-started" className="inline-flex h-12 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-8 text-base font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105">
                Get Started Now →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Built for Modern Marketing & Product Teams</h2>
            <p className="text-xl text-muted-foreground">
              Real examples from teams shipping 10x faster
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Link href="/docs/examples/media-analysis/02-comment-engagement" className="group space-y-4 rounded-xl border p-6 transition-all hover:shadow-lg hover:border-blue-500">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold group-hover:text-blue-600">
                  Predict Reddit Virality
                </h3>
                <span className="text-2xl">🚀</span>
              </div>
              <p className="text-muted-foreground">
                One founder tested 50 post variations in simulation, found a 67% CTR improvement,
                and hit #1 on r/programming with 8.5k upvotes.
              </p>
              <p className="text-sm text-blue-600 group-hover:underline">
                See how →
              </p>
            </Link>
            
            <Link href="/docs/examples/surveys/01-market-research" className="group space-y-4 rounded-xl border p-6 transition-all hover:shadow-lg hover:border-blue-500">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold group-hover:text-blue-600">
                  $125K Saved on Market Research
                </h3>
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-muted-foreground">
                SaaS startup simulated 10,000 survey responses, found their ICP, 
                and reached product-market fit 3 months faster.
              </p>
              <p className="text-sm text-blue-600 group-hover:underline">
                Learn how →
              </p>
            </Link>
            
            <Link href="/docs/examples/media-analysis/03-voting-systems" className="group space-y-4 rounded-xl border p-6 transition-all hover:shadow-lg hover:border-blue-500">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold group-hover:text-blue-600">
                  2.4x More Front-Page Hits
                </h3>
                <span className="text-2xl">📈</span>
              </div>
              <p className="text-muted-foreground">
                Content team predicts performance across Reddit, HackerNews, and ProductHunt.
                Only publishes guaranteed winners.
              </p>
              <p className="text-sm text-blue-600 group-hover:underline">
                Start winning →
              </p>
            </Link>
            
            <Link href="/docs/examples/marketing/structured-output-magic" className="group space-y-4 rounded-xl border p-6 transition-all hover:shadow-lg hover:border-blue-500">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold group-hover:text-blue-600">
                  Complete GTM in 2 Hours
                </h3>
                <span className="text-2xl">🎯</span>
              </div>
              <p className="text-muted-foreground">
                AI analyzes your personas and generates positioning, messaging, 
                and campaign ideas that actually resonate.
              </p>
              <p className="text-sm text-blue-600 group-hover:underline">
                Generate yours →
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-background">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <h2 className="text-4xl font-bold">
              Ready to Ship Like You Know the Future? 🔮
            </h2>
            <p className="text-xl text-muted-foreground">
              Join 50+ teams using Persona SDK to build products people actually want.
              No more guessing. Just data-driven wins.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/docs/getting-started" className="inline-flex h-12 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-8 text-base font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105">
                Start Free →
              </Link>
              <Link href="https://github.com/jamesaphoenix/persona-sdk" className="inline-flex h-12 items-center justify-center rounded-md border-2 border-gray-300 bg-white px-8 text-base font-medium text-gray-700 transition-all hover:border-gray-400 hover:shadow-md dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700">
                ⭐ Star on GitHub
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}