'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function AIPage() {
  const [apiKey, setApiKey] = useState('')
  const [prompt, setPrompt] = useState('Create a persona for a tech-savvy millennial interested in sustainable living')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [mode, setMode] = useState<'single' | 'multiple' | 'optimize'>('single')
  const [count, setCount] = useState(3)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Simulate AI generation for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockPersona = {
        id: `persona-${Date.now()}`,
        name: 'Alex Chen',
        age: 28,
        occupation: 'Software Engineer',
        attributes: {
          sustainability_interest: 0.9,
          tech_savviness: 0.95,
          income_level: 'upper-middle',
          location: 'San Francisco, CA',
          lifestyle: 'urban-conscious'
        }
      }

      const data = mode === 'multiple' 
        ? Array.from({ length: count }, (_, i) => ({
            ...mockPersona,
            id: `persona-${Date.now()}-${i}`,
            name: `Person ${i + 1}`
          }))
        : mode === 'optimize'
        ? {
            original_prompt: prompt,
            optimized_prompt: 'Create a detailed persona for a 25-30 year old tech professional who prioritizes environmental sustainability in their purchasing decisions and lifestyle choices',
            improvements: ['Added age range', 'Specified profession', 'Clarified sustainability focus']
          }
        : mockPersona

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">AI-Powered Features</h1>
        <p className="text-gray-600">
          Demo AI features with simulated responses (actual SDK functionality tested in core suite)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="api-key">OpenAI API Key (demo mode)</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-... (not required for demo)"
              disabled
            />
            <p className="text-sm text-gray-500 mt-1">
              Demo mode uses simulated responses
            </p>
          </div>

          <div>
            <Label>Generation Mode</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={mode === 'single' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('single')}
              >
                Single Persona
              </Button>
              <Button
                variant={mode === 'multiple' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('multiple')}
              >
                Multiple Personas
              </Button>
              <Button
                variant={mode === 'optimize' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('optimize')}
              >
                Optimize Prompt
              </Button>
            </div>
          </div>

          {mode === 'multiple' && (
            <div>
              <Label htmlFor="count">Number of Personas</Label>
              <Input
                id="count"
                type="number"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                min={1}
                max={10}
              />
            </div>
          )}

          <div>
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Describe the persona(s) you want to generate..."
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Generating...' : 'Generate'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Demo Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <p>
            This page demonstrates AI features with simulated responses.
            Real SDK functionality is tested in the core test suite with 715+ passing tests.
          </p>
          <ul className="mt-2 space-y-1">
            <li>• PersonaBuilder.fromPrompt(): AI-powered persona generation</li>
            <li>• PersonaBuilder.generateMultiple(): Batch persona creation</li>
            <li>• PersonaBuilder.optimizePrompt(): Prompt enhancement</li>
            <li>• Full testing with VCR cassettes in runtime test suite</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}