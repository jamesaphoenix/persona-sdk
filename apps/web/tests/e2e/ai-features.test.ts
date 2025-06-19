import { describe, it, expect, beforeAll } from 'vitest'
import { PersonaBuilder } from '@jamesaphoenix/persona-sdk'

describe('AI Features E2E (Mocked)', () => {
  it('generates a single persona with mocked AI', async () => {
    // Using mocked fromPrompt from setup.ts
    const prompt = 'Create a persona for a tech-savvy millennial'
    const persona = await PersonaBuilder.create().fromPrompt(prompt, {
      apiKey: 'mock-key'
    })
    
    expect(persona).toBeDefined()
    expect(persona.name).toBe('AI Generated Person')
    expect(persona.age).toBe(28)
    expect(persona.location).toBe('San Francisco')
    expect(persona.attributes).toMatchObject({
      interests: 'technology, sustainability',
      personality: 'innovative, eco-conscious'
    })
  })

  it('optimizes prompts with mocked response', async () => {
    const basePrompt = 'young professional'
    const optimizedPrompt = await PersonaBuilder.optimizePrompt(basePrompt, {
      apiKey: 'mock-key'
    })
    
    expect(optimizedPrompt).toBeDefined()
    expect(optimizedPrompt).toContain('age between 25-35')
    expect(optimizedPrompt).toContain('major tech hub')
  })

  it('generates multiple personas efficiently', async () => {
    const prompt = 'Create diverse personas'
    const personas = await PersonaBuilder.generateMultiple(prompt, 3, {
      apiKey: 'mock-key'
    })
    
    expect(personas).toHaveLength(3)
    expect(personas[0].name).toBe('Person 1')
    expect(personas[1].name).toBe('Person 2')
    expect(personas[2].name).toBe('Person 3')
    
    // Check diversity
    const ages = personas.map(p => p.age)
    expect(new Set(ages).size).toBe(3)
  })

  it('suggests attributes based on context', async () => {
    const context = {
      industry: 'gaming',
      targetAudience: 'competitive players'
    }
    
    const suggestions = await PersonaBuilder.suggestAttributes(context, {
      apiKey: 'mock-key'
    })
    
    expect(suggestions).toContain('competitive_level')
    expect(suggestions).toContain('gaming_hours_per_week')
    expect(suggestions).toContain('preferred_game_genres')
  })
})