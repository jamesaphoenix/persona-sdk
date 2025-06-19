import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock expensive PersonaBuilder AI methods
vi.mock('@jamesaphoenix/persona-sdk', async () => {
  const actual = await vi.importActual('@jamesaphoenix/persona-sdk')
  
  return {
    ...actual,
    PersonaBuilder: {
      ...actual.PersonaBuilder,
      create: () => ({
        ...actual.PersonaBuilder.create(),
        fromPrompt: vi.fn().mockResolvedValue({
          id: 'mock-id',
          name: 'AI Generated Person',
          age: 28,
          location: 'San Francisco',
          attributes: {
            interests: 'technology, sustainability',
            personality: 'innovative, eco-conscious'
          }
        })
      }),
      generateMultiple: vi.fn().mockResolvedValue([
        {
          id: 'mock-1',
          name: 'Person 1',
          age: 25,
          location: 'New York'
        },
        {
          id: 'mock-2', 
          name: 'Person 2',
          age: 35,
          location: 'London'
        },
        {
          id: 'mock-3',
          name: 'Person 3', 
          age: 30,
          location: 'Tokyo'
        }
      ]),
      optimizePrompt: vi.fn().mockResolvedValue(
        'Create a detailed persona including age between 25-35, location in a major tech hub, interests in technology and sustainability'
      ),
      suggestAttributes: vi.fn().mockResolvedValue([
        'competitive_level',
        'gaming_hours_per_week',
        'preferred_game_genres',
        'skill_rating'
      ])
    }
  }
})