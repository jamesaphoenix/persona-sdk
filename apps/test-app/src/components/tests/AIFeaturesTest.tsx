'use client'

import {
  DistributionSelectorLangChain,
  StructuredOutputGenerator,
  MediaToPersonaGenerator,
  PersonaGroup,
  NormalDistribution,
  UniformDistribution,
} from '@jamesaphoenix/persona-sdk'
import { z } from 'zod'
import { TestWrapper } from '../TestWrapper'
import { useState } from 'react'

export function AIFeaturesTest() {
  const [apiKey, setApiKey] = useState('')
  const [lastResult, setLastResult] = useState<any>(null)

  const checkApiKey = () => {
    if (!apiKey) {
      throw new Error('Please enter your OpenAI API key')
    }
  }

  return (
    <TestWrapper title="AI Features Tests" className="AIFeatures">
      {({ runTest }) => (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              OpenAI API Key:
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full p-2 border rounded"
            />
            <p className="text-xs text-gray-500 mt-1">
              API calls will be recorded to cassettes for replay
            </p>
          </div>

          <button
            onClick={() => runTest('DistributionSelectorLangChain', async () => {
              checkApiKey()
              
              const selector = new DistributionSelectorLangChain(apiKey)
              const result = await selector.selectDistribution({
                attribute: 'age',
                context: 'Young tech professionals in Silicon Valley aged 22-35 with high income variation, mostly engineers and designers',
                constraints: {
                  min: 22,
                  max: 35
                }
              })
              
              if (!result.distribution) {
                throw new Error('No distribution returned')
              }
              
              if (!result.reasoning) {
                throw new Error('No reasoning provided')
              }
              
              console.log('Selected distributions:', result)
              setLastResult(result)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test DistributionSelectorLangChain
          </button>

          <button
            onClick={() => runTest('StructuredOutputGenerator', async () => {
              checkApiKey()
              
              // Create a test persona group
              const group = new PersonaGroup('Tech Workers')
              group.generateFromDistributions(10, {
                age: new NormalDistribution(28, 5),
                occupation: 'Software Engineer',
                sex: 'other',
                salary: new UniformDistribution(80000, 150000),
              })
              
              const generator = new StructuredOutputGenerator(apiKey)
              
              const InsightsSchema = z.object({
                avgAge: z.number(),
                salaryRange: z.object({
                  min: z.number(),
                  max: z.number(),
                }),
                insights: z.array(z.string()),
                recommendations: z.array(z.string()),
              })
              
              const result = await generator.generate(
                group,
                InsightsSchema,
                'Analyze this tech worker group and provide insights'
              )
              
              if (!result.data) {
                throw new Error('No structured data returned')
              }
              
              console.log('Structured output:', result)
              setLastResult(result)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test StructuredOutputGenerator
          </button>

          <button
            onClick={() => runTest('MediaToPersonaGenerator.fromTextPost', async () => {
              checkApiKey()
              
              const generator = new MediaToPersonaGenerator(apiKey)
              
              const result = await generator.fromTextPost(
                'Just finished my third marathon this year! Training 6 days a week finally paid off. Next goal: qualify for Boston! 🏃‍♂️ #running #marathontraining',
                { count: 3 }
              )
              
              if (!result.personas || result.personas.length === 0) {
                throw new Error('No personas generated from text')
              }
              
              // Check personas have expected attributes
              const persona = result.personas[0]
              if (!persona.attributes.interests) {
                throw new Error('Persona missing interests attribute')
              }
              
              console.log('Generated personas from text:', result)
              setLastResult(result)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test MediaToPersonaGenerator - Text Post
          </button>

          <button
            onClick={() => runTest('StructuredOutputGenerator.generateCustom', async () => {
              checkApiKey()
              
              const generator = new StructuredOutputGenerator(apiKey)
              
              const ProductIdeaSchema = z.object({
                productName: z.string(),
                targetMarket: z.string(),
                features: z.array(z.string()),
                pricing: z.object({
                  model: z.enum(['subscription', 'one-time', 'freemium']),
                  price: z.number(),
                }),
                marketSize: z.number(),
              })
              
              // Create a test persona group for generateCustom
              const group = new PersonaGroup('Developers')
              group.generateFromDistributions(10, {
                age: new NormalDistribution(28, 5),
                occupation: 'Software Engineer',
                sex: 'other',
              })

              const result = await generator.generateCustom(
                group,
                ProductIdeaSchema,
                'Generate a product idea based on this concept: A tool for developers to manage their API keys securely'
              )
              
              if (!result.data) {
                throw new Error('No custom structured data returned')
              }
              
              console.log('Custom structured output:', result)
              setLastResult(result)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test StructuredOutputGenerator - Custom
          </button>

          <button
            onClick={() => runTest('PersonaGroup.generateStructuredOutput', async () => {
              checkApiKey()
              
              const group = new PersonaGroup('Beta Testers')
              group.generateFromDistributions(20, {
                age: new NormalDistribution(30, 8),
                occupation: 'various',
                sex: 'other',
                tech_savvy: new UniformDistribution(5, 10),
              })
              
              const FeedbackSchema = z.object({
                overallSentiment: z.enum(['positive', 'neutral', 'negative']),
                topConcerns: z.array(z.string()).max(5),
                featureRequests: z.array(z.string()).max(5),
                adoptionLikelihood: z.number().min(0).max(100),
              })
              
              const result = await group.generateStructuredOutput(
                FeedbackSchema,
                'Analyze this beta tester group and predict their feedback for a new developer tool'
              )
              
              if (!result) {
                throw new Error('No structured output from PersonaGroup')
              }
              
              console.log('PersonaGroup structured output:', result)
              setLastResult(result)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test PersonaGroup.generateStructuredOutput
          </button>

          {lastResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h4 className="font-semibold mb-2">Last AI Result:</h4>
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(lastResult, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </TestWrapper>
  )
}