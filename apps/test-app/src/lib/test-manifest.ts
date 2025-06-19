export interface FunctionTest {
  tested: boolean
  lastTest: string | null
  error?: string
  duration?: number
}

export interface TestManifest {
  lastUpdated: string
  testedFunctions: Record<string, Record<string, FunctionTest>>
  coverage: {
    total: number
    tested: number
    percentage: number
  }
}

export class TestTracker {
  private static instance: TestTracker
  private manifest: TestManifest = {
    lastUpdated: new Date().toISOString(),
    testedFunctions: {},
    coverage: {
      total: 0,
      tested: 0,
      percentage: 0,
    },
  }

  static getInstance(): TestTracker {
    if (!TestTracker.instance) {
      TestTracker.instance = new TestTracker()
    }
    return TestTracker.instance
  }

  async loadManifest() {
    try {
      const response = await fetch('/api/test-manifest')
      if (response.ok) {
        this.manifest = await response.json()
      }
    } catch (error) {
      console.error('Failed to load test manifest:', error)
    }
  }

  async saveManifest() {
    try {
      await fetch('/api/test-manifest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.manifest),
      })
    } catch (error) {
      console.error('Failed to save test manifest:', error)
    }
  }

  markFunctionTested(
    className: string,
    functionName: string,
    error?: string,
    duration?: number
  ) {
    if (!this.manifest.testedFunctions[className]) {
      this.manifest.testedFunctions[className] = {}
    }

    this.manifest.testedFunctions[className][functionName] = {
      tested: !error,
      lastTest: new Date().toISOString(),
      error,
      duration,
    }

    this.updateCoverage()
    this.manifest.lastUpdated = new Date().toISOString()
    
    // Auto-save after each update
    this.saveManifest()
  }

  private updateCoverage() {
    let total = 0
    let tested = 0

    Object.values(this.manifest.testedFunctions).forEach(classFunctions => {
      Object.values(classFunctions).forEach(func => {
        total++
        if (func.tested) tested++
      })
    })

    this.manifest.coverage = {
      total,
      tested,
      percentage: total > 0 ? (tested / total) * 100 : 0,
    }
  }

  getManifest() {
    return this.manifest
  }

  getClassCoverage(className: string) {
    const classFunctions = this.manifest.testedFunctions[className] || {}
    const total = Object.keys(classFunctions).length
    const tested = Object.values(classFunctions).filter(f => f.tested).length
    
    return {
      total,
      tested,
      percentage: total > 0 ? (tested / total) * 100 : 0,
      functions: classFunctions,
    }
  }
}