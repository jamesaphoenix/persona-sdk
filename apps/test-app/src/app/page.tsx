'use client'

import { useState, useEffect } from 'react'
import { CassetteManager } from '@/lib/cassettes'
import { TestTracker } from '@/lib/test-manifest'
import { PersonaTest } from '@/components/tests/PersonaTest'
import { PersonaGroupTest } from '@/components/tests/PersonaGroupTest'
import { DistributionTest } from '@/components/tests/DistributionTest'
import { AIFeaturesTest } from '@/components/tests/AIFeaturesTest'
import { 
  Play, 
  Pause, 
  Download, 
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Home() {
  const [mode, setMode] = useState<'record' | 'replay'>('replay')
  const [currentCassette, setCurrentCassette] = useState('default')
  const [manifest, setManifest] = useState<any>(null)
  const [cassetteStats, setCassetteStats] = useState<any>(null)

  useEffect(() => {
    // Initialize cassette manager and test tracker
    const init = async () => {
      const cassetteMgr = CassetteManager.getInstance()
      const testTracker = TestTracker.getInstance()
      
      cassetteMgr.setMode(mode)
      await cassetteMgr.loadCassette(currentCassette)
      await cassetteMgr.start()
      
      await testTracker.loadManifest()
      setManifest(testTracker.getManifest())
      setCassetteStats(cassetteMgr.getCassetteStats())
    }
    
    init()
  }, [mode, currentCassette])

  const refreshStats = async () => {
    const testTracker = TestTracker.getInstance()
    await testTracker.loadManifest()
    setManifest(testTracker.getManifest())
    
    const cassetteMgr = CassetteManager.getInstance()
    setCassetteStats(cassetteMgr.getCassetteStats())
  }

  const downloadManifest = () => {
    const data = JSON.stringify(manifest, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'test-manifest.json'
    a.click()
  }

  const downloadCassettes = async () => {
    try {
      const response = await fetch(`/api/cassettes/${currentCassette}`)
      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentCassette}-cassette.json`
      a.click()
    } catch (error) {
      toast.error('Failed to download cassette')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Persona SDK Runtime Testing
            </h1>
            <button
              onClick={refreshStats}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Stats
            </button>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cassette Mode */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Cassette Mode
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMode('record')
                    toast.success('Switched to record mode')
                  }}
                  className={`flex-1 px-4 py-2 rounded ${
                    mode === 'record'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <Play className="w-4 h-4 inline mr-2" />
                  Record
                </button>
                <button
                  onClick={() => {
                    setMode('replay')
                    toast.success('Switched to replay mode')
                  }}
                  className={`flex-1 px-4 py-2 rounded ${
                    mode === 'replay'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <Pause className="w-4 h-4 inline mr-2" />
                  Replay
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {mode === 'record' 
                  ? '🔴 Recording API calls to cassettes'
                  : '▶️ Replaying from cassettes'}
              </p>
            </div>

            {/* Cassette Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Cassette Name
              </label>
              <input
                type="text"
                value={currentCassette}
                onChange={(e) => setCurrentCassette(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
              {cassetteStats && (
                <p className="text-xs text-gray-500 mt-1">
                  {cassetteStats.entryCount} recorded calls
                </p>
              )}
            </div>

            {/* Actions */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Data Management
              </label>
              <div className="flex gap-2">
                <button
                  onClick={downloadManifest}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  <Download className="w-4 h-4 inline mr-1" />
                  Manifest
                </button>
                <button
                  onClick={downloadCassettes}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  <Download className="w-4 h-4 inline mr-1" />
                  Cassettes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Coverage Stats */}
        {manifest && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Test Coverage</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {manifest.coverage.total}
                </div>
                <div className="text-sm text-gray-500">Total Functions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {manifest.coverage.tested}
                </div>
                <div className="text-sm text-gray-500">Tested</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {manifest.coverage.total - manifest.coverage.tested}
                </div>
                <div className="text-sm text-gray-500">Untested</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {manifest.coverage.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Coverage</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-600 h-4 rounded-full transition-all"
                  style={{ width: `${manifest.coverage.percentage}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Test Components */}
        <div className="space-y-6">
          <PersonaTest />
          <PersonaGroupTest />
          <DistributionTest />
          <AIFeaturesTest />
        </div>
      </div>
    </div>
  )
}