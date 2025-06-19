import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export interface Cassette {
  name: string
  recordings: Recording[]
}

export interface Recording {
  request: {
    url: string
    method: string
    headers: Record<string, string>
    body?: any
  }
  response: {
    status: number
    headers: Record<string, string>
    body: any
  }
  timestamp: string
}

export class CassetteManager {
  private cassettesDir: string
  private currentCassette: Cassette | null = null
  private mode: 'record' | 'replay' = 'replay'
  private server = setupServer()

  constructor(cassettesDir: string = path.join(process.cwd(), 'cassettes')) {
    this.cassettesDir = cassettesDir
  }

  async init() {
    await fs.mkdir(this.cassettesDir, { recursive: true })
    this.server.listen({ onUnhandledRequest: 'bypass' })
  }

  async close() {
    this.server.close()
    if (this.currentCassette && this.mode === 'record') {
      await this.saveCassette()
    }
  }

  setMode(mode: 'record' | 'replay') {
    this.mode = mode
  }

  async useCassette(name: string) {
    if (this.currentCassette && this.mode === 'record') {
      await this.saveCassette()
    }

    const cassettePath = path.join(this.cassettesDir, `${name}.json`)
    
    if (this.mode === 'replay') {
      try {
        const data = await fs.readFile(cassettePath, 'utf-8')
        this.currentCassette = JSON.parse(data)
      } catch {
        this.currentCassette = { name, recordings: [] }
      }
    } else {
      this.currentCassette = { name, recordings: [] }
    }

    this.setupHandlers()
  }

  private setupHandlers() {
    this.server.resetHandlers()

    if (this.mode === 'replay' && this.currentCassette) {
      // Set up handlers for recorded requests
      this.server.use(
        http.all('*', ({ request }) => {
          const recording = this.findRecording(request)
          if (recording) {
            return HttpResponse.json(recording.response.body, {
              status: recording.response.status,
              headers: recording.response.headers,
            })
          }
          return HttpResponse.error()
        })
      )
    } else if (this.mode === 'record') {
      // Intercept and record all requests
      this.server.use(
        http.all('*', async ({ request }) => {
          const url = request.url
          const method = request.method
          const headers = Object.fromEntries(request.headers.entries())
          const body = await request.text()

          // Make real request
          const response = await fetch(url, {
            method,
            headers,
            body: body || undefined,
          })

          const responseBody = await response.text()
          const responseHeaders = Object.fromEntries(response.headers.entries())

          // Record the interaction
          if (this.currentCassette) {
            this.currentCassette.recordings.push({
              request: {
                url,
                method,
                headers,
                body: body ? JSON.parse(body) : undefined,
              },
              response: {
                status: response.status,
                headers: responseHeaders,
                body: responseBody ? JSON.parse(responseBody) : undefined,
              },
              timestamp: new Date().toISOString(),
            })
          }

          return HttpResponse.json(
            responseBody ? JSON.parse(responseBody) : undefined,
            {
              status: response.status,
              headers: responseHeaders,
            }
          )
        })
      )
    }
  }

  private findRecording(request: Request): Recording | undefined {
    if (!this.currentCassette) return undefined

    const url = request.url
    const method = request.method

    return this.currentCassette.recordings.find(
      (r) => r.request.url === url && r.request.method === method
    )
  }

  private async saveCassette() {
    if (!this.currentCassette) return

    const cassettePath = path.join(
      this.cassettesDir,
      `${this.currentCassette.name}.json`
    )
    await fs.writeFile(
      cassettePath,
      JSON.stringify(this.currentCassette, null, 2),
      'utf-8'
    )
  }

  // Helper to generate unique cassette names for tests
  static generateCassetteName(testName: string): string {
    const hash = crypto.createHash('md5').update(testName).digest('hex').slice(0, 8)
    return `${testName.replace(/[^a-zA-Z0-9]/g, '-')}-${hash}`
  }
}