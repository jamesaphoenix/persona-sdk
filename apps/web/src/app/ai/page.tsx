'use client'

import { useState } from 'react'
import { PersonaBuilder } from '@jamesaphoenix/persona-sdk'
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
    if (!apiKey && process.env.NODE_ENV === 'production') {
      setError('Please provide an OpenAI API key')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      let data
      const options = { apiKey: apiKey || process.env.OPENAI_API_KEY || 'test-key' }

      switch (mode) {
        case 'single':
          data = await PersonaBuilder.fromPrompt(prompt, options)
          break
        case 'multiple':
          data = await PersonaBuilder.generateMultiple(prompt, count, options)
          break
        case 'optimize':
          data = await PersonaBuilder.optimizePrompt(prompt, options)
          break
      }

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
          Test AI features with VCR cassettes for recording and replaying API calls
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="api-key">OpenAI API Key (optional in test mode)</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave empty to use cassettes in replay mode
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

      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-900">Cassette Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-yellow-800">
          <p>
            This page uses VCR cassettes to record and replay OpenAI API calls.
            Cassettes are stored in <code className="bg-yellow-100 px-1 rounded">cassettes/</code> directory.
          </p>
          <ul className="mt-2 space-y-1">
            <li>• First run with API key: Records responses</li>
            <li>• Subsequent runs: Uses recorded cassettes</li>
            <li>• Set <code className="bg-yellow-100 px-1 rounded">CASSETTE_MODE=record</code> to re-record</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}