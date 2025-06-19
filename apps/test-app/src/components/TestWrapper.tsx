'use client'

import { useState, useEffect } from 'react'
import { CassetteManager } from '@/lib/cassettes'
import { TestTracker } from '@/lib/test-manifest'
import { CheckCircle, XCircle, Clock, Play } from 'lucide-react'
import toast from 'react-hot-toast'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'success' | 'error'
  error?: string
  duration?: number
}

interface TestWrapperProps {
  title: string
  className: string
  children: (props: {
    runTest: (name: string, testFn: () => Promise<void>) => Promise<void>
    results: TestResult[]
  }) => React.ReactNode
}

export function TestWrapper({ title, className, children }: TestWrapperProps) {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTest = async (name: string, testFn: () => Promise<void>) => {
    setResults(prev => [...prev.filter(r => r.name !== name), { name, status: 'running' }])
    
    const startTime = Date.now()
    try {
      await testFn()
      const duration = Date.now() - startTime
      
      setResults(prev => 
        prev.map(r => 
          r.name === name 
            ? { ...r, status: 'success', duration }
            : r
        )
      )
      
      TestTracker.getInstance().markFunctionTested(className, name, undefined, duration)
      toast.success(`✅ ${name} passed`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const duration = Date.now() - startTime
      
      setResults(prev =>
        prev.map(r =>
          r.name === name
            ? { ...r, status: 'error', error: errorMessage, duration }
            : r
        )
      )
      
      TestTracker.getInstance().markFunctionTested(className, name, errorMessage, duration)
      toast.error(`❌ ${name} failed: ${errorMessage}`)
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'running':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-300" />
    }
  }

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length
  const coverage = results.length > 0 ? (successCount / results.length) * 100 : 0

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-green-600">✓ {successCount} passed</span>
          <span className="text-red-600">✗ {errorCount} failed</span>
          <span className="text-gray-600">{coverage.toFixed(1)}% coverage</span>
        </div>
      </div>

      <div className="space-y-4">
        {children({ runTest, results })}
      </div>

      {results.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-3">Test Results</h3>
          <div className="space-y-2">
            {results.map((result) => (
              <div
                key={result.name}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded"
              >
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="font-medium">{result.name}</div>
                  {result.error && (
                    <div className="text-sm text-red-600 mt-1">{result.error}</div>
                  )}
                  {result.duration && (
                    <div className="text-sm text-gray-500 mt-1">
                      Duration: {result.duration}ms
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}