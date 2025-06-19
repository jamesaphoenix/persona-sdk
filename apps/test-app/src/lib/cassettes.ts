import { setupWorker } from 'msw/browser'
import { http, HttpResponse } from 'msw'
import type { RequestHandler } from 'msw'

export interface CassetteEntry {
  url: string
  method: string
  requestBody: any
  responseBody: any
  responseHeaders: Record<string, string>
  timestamp: string
}

export interface Cassette {
  name: string
  entries: CassetteEntry[]
  createdAt: string
  updatedAt: string
}

export class CassetteManager {
  private static instance: CassetteManager
  private cassettes: Map<string, Cassette> = new Map()
  private currentCassette: string | null = null
  private mode: 'record' | 'replay' = 'replay'
  private worker: ReturnType<typeof setupWorker> | null = null

  static getInstance(): CassetteManager {
    if (!CassetteManager.instance) {
      CassetteManager.instance = new CassetteManager()
    }
    return CassetteManager.instance
  }

  setMode(mode: 'record' | 'replay') {
    this.mode = mode
    console.log(`Cassette mode set to: ${mode}`)
  }

  async loadCassette(name: string) {
    try {
      const response = await fetch(`/api/cassettes/${name}`)
      if (response.ok) {
        const cassette = await response.json()
        this.cassettes.set(name, cassette)
        this.currentCassette = name
        console.log(`Loaded cassette: ${name}`)
      } else if (this.mode === 'record') {
        // Create new cassette if recording
        const newCassette: Cassette = {
          name,
          entries: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        this.cassettes.set(name, newCassette)
        this.currentCassette = name
        console.log(`Created new cassette: ${name}`)
      }
    } catch (error) {
      console.error('Failed to load cassette:', error)
      if (this.mode === 'record') {
        const newCassette: Cassette = {
          name,
          entries: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        this.cassettes.set(name, newCassette)
        this.currentCassette = name
      }
    }
  }

  async saveCassette() {
    if (!this.currentCassette) return

    const cassette = this.cassettes.get(this.currentCassette)
    if (!cassette) return

    try {
      await fetch(`/api/cassettes/${this.currentCassette}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cassette),
      })
      console.log(`Saved cassette: ${this.currentCassette}`)
    } catch (error) {
      console.error('Failed to save cassette:', error)
    }
  }

  findEntry(url: string, method: string, body: any): CassetteEntry | undefined {
    if (!this.currentCassette) return undefined

    const cassette = this.cassettes.get(this.currentCassette)
    if (!cassette) return undefined

    return cassette.entries.find(entry => {
      return (
        entry.url === url &&
        entry.method === method &&
        JSON.stringify(entry.requestBody) === JSON.stringify(body)
      )
    })
  }

  addEntry(entry: CassetteEntry) {
    if (!this.currentCassette) return

    const cassette = this.cassettes.get(this.currentCassette)
    if (!cassette) return

    cassette.entries.push(entry)
    cassette.updatedAt = new Date().toISOString()
    
    // Auto-save after each new entry
    this.saveCassette()
  }

  createHandlers(): RequestHandler[] {
    const openAIHandler = http.post('https://api.openai.com/v1/*', async ({ request }) => {
      const url = request.url
      const body = await request.json()

      if (this.mode === 'replay') {
        // Try to find recorded response
        const entry = this.findEntry(url, 'POST', body)
        if (entry) {
          console.log(`Replaying response for: ${url}`)
          return HttpResponse.json(entry.responseBody, {
            headers: entry.responseHeaders,
          })
        } else {
          console.warn(`No cassette entry found for: ${url}`)
          return HttpResponse.json(
            { error: 'No cassette entry found. Switch to record mode.' },
            { status: 404 }
          )
        }
      } else {
        // Record mode - pass through and record
        console.log(`Recording request to: ${url}`)
        
        // Make real request
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': request.headers.get('Authorization') || '',
          },
          body: JSON.stringify(body),
        })

        const responseBody = await response.json()
        const responseHeaders: Record<string, string> = {}
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value
        })

        // Record the interaction
        const entry: CassetteEntry = {
          url,
          method: 'POST',
          requestBody: body,
          responseBody,
          responseHeaders,
          timestamp: new Date().toISOString(),
        }
        this.addEntry(entry)

        return HttpResponse.json(responseBody, {
          headers: responseHeaders,
        })
      }
    })

    return [openAIHandler]
  }

  async start() {
    if (typeof window === 'undefined') return

    const { setupWorker } = await import('msw/browser')
    const handlers = this.createHandlers()
    
    this.worker = setupWorker(...handlers)
    await this.worker.start({
      onUnhandledRequest: 'bypass',
    })
    
    console.log('MSW worker started for cassette recording/replay')
  }

  async stop() {
    if (this.worker) {
      await this.worker.stop()
      this.worker = null
    }
  }

  getCassetteStats() {
    if (!this.currentCassette) return null

    const cassette = this.cassettes.get(this.currentCassette)
    if (!cassette) return null

    return {
      name: cassette.name,
      entryCount: cassette.entries.length,
      createdAt: cassette.createdAt,
      updatedAt: cassette.updatedAt,
      mode: this.mode,
    }
  }
}