import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Users, Bot, Sparkles, Database } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Persona SDK Test Suite</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Comprehensive testing environment for the Persona SDK with VCR cassettes, 
          component tests, and e2e testing capabilities
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/builder">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Persona Builder
              </CardTitle>
              <CardDescription>
                Create individual personas with custom attributes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-primary">
                Explore builder features
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/group">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Persona Groups
              </CardTitle>
              <CardDescription>
                Manage collections of personas and generate statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-primary">
                Manage groups
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ai">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Features
              </CardTitle>
              <CardDescription>
                Test AI-powered persona generation with OpenAI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-primary">
                Test with cassettes
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/distributions">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Distributions
              </CardTitle>
              <CardDescription>
                Explore statistical distributions and generators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-primary">
                View distributions
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>Testing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• Unit tests: Run <code className="bg-white px-2 py-1 rounded">pnpm test</code></li>
            <li>• Integration tests: Located in <code className="bg-white px-2 py-1 rounded">tests/integration/</code></li>
            <li>• E2E tests: Run <code className="bg-white px-2 py-1 rounded">pnpm test:e2e</code></li>
            <li>• Cassette mode: Set <code className="bg-white px-2 py-1 rounded">CASSETTE_MODE=record</code> to record API calls</li>
            <li>• Coverage: Run <code className="bg-white px-2 py-1 rounded">pnpm test:coverage</code></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}