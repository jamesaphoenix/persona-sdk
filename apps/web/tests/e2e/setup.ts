import { beforeAll, afterAll, beforeEach } from 'vitest'
import { CassetteManager } from '../../src/lib/cassettes'

// Global cassette manager
export const cassette = new CassetteManager()

beforeAll(async () => {
  await cassette.init()
  
  // Set mode based on environment variable
  const mode = process.env.CASSETTE_MODE as 'record' | 'replay' || 'replay'
  cassette.setMode(mode)
})

afterAll(async () => {
  await cassette.close()
})

beforeEach(async ({ task }) => {
  // Use test name as cassette name
  const cassetteName = CassetteManager.generateCassetteName(task.name)
  await cassette.useCassette(cassetteName)
})

// Mock environment variables
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-key'