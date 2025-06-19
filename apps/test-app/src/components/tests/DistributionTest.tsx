'use client'

import {
  NormalDistribution,
  UniformDistribution,
  ExponentialDistribution,
  BetaDistribution,
  CategoricalDistribution,
  SeedManager,
} from '@jamesaphoenix/persona-sdk'
import { TestWrapper } from '../TestWrapper'
import { useState } from 'react'

export function DistributionTest() {
  const [samples, setSamples] = useState<Record<string, number[]>>({})

  const validateSamples = (values: number[], min?: number, max?: number) => {
    if (values.length === 0) throw new Error('No samples generated')
    if (min !== undefined && Math.min(...values) < min) {
      throw new Error(`Sample below minimum: ${Math.min(...values)} < ${min}`)
    }
    if (max !== undefined && Math.max(...values) > max) {
      throw new Error(`Sample above maximum: ${Math.max(...values)} > ${max}`)
    }
  }

  return (
    <TestWrapper title="Distribution Tests" className="Distributions">
      {({ runTest }) => (
        <>
          <div className="mb-4 p-3 bg-yellow-50 rounded">
            <p className="text-sm">Testing with deterministic seeds for reproducibility</p>
          </div>

          <button
            onClick={() => runTest('NormalDistribution.sample', async () => {
              SeedManager.setSeed('test', 12345)
              const dist = new NormalDistribution(100, 15)
              const sample = dist.sample()
              
              if (typeof sample !== 'number') {
                throw new Error('Sample should be a number')
              }
              
              // Test multiple samples
              const values = Array(100).fill(0).map(() => dist.sample())
              validateSamples(values)
              
              // Check mean is roughly correct
              const mean = values.reduce((a, b) => a + b) / values.length
              if (Math.abs(mean - 100) > 5) {
                throw new Error(`Mean ${mean} is too far from expected 100`)
              }
              
              setSamples(prev => ({ ...prev, normal: values }))
              SeedManager.reset()
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test NormalDistribution
          </button>

          <button
            onClick={() => runTest('NormalDistribution.withBounds', async () => {
              SeedManager.setSeed('test', 12345)
              const dist = new NormalDistribution(30, 5)
                .withMin(18)
                .withMax(65)
                .withRounding()
              
              const values = dist.sampleMany(100)
              validateSamples(values, 18, 65)
              
              // Check all values are integers
              if (!values.every(v => Number.isInteger(v))) {
                throw new Error('withRounding() should produce integers')
              }
              
              setSamples(prev => ({ ...prev, normalBounded: values }))
              SeedManager.reset()
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test NormalDistribution with bounds
          </button>

          <button
            onClick={() => runTest('UniformDistribution', async () => {
              const dist = new UniformDistribution(0, 100)
              const values = dist.sampleMany(100)
              
              validateSamples(values, 0, 100)
              
              // Check uniform distribution
              const min = Math.min(...values)
              const max = Math.max(...values)
              if (min > 10 || max < 90) {
                throw new Error('Uniform distribution not covering expected range')
              }
              
              setSamples(prev => ({ ...prev, uniform: values }))
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test UniformDistribution
          </button>

          <button
            onClick={() => runTest('ExponentialDistribution', async () => {
              const dist = new ExponentialDistribution(2)
              const values = dist.sampleMany(100)
              
              validateSamples(values, 0)
              
              // Check that most values are small (exponential decay)
              const smallValues = values.filter(v => v < 1).length
              if (smallValues < 50) {
                throw new Error('Exponential distribution not showing expected decay')
              }
              
              setSamples(prev => ({ ...prev, exponential: values }))
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test ExponentialDistribution
          </button>

          <button
            onClick={() => runTest('BetaDistribution', async () => {
              const dist = new BetaDistribution(2, 5)
              const values = dist.sampleMany(100)
              
              validateSamples(values, 0, 1)
              
              // Beta distribution values should be between 0 and 1
              if (!values.every(v => v >= 0 && v <= 1)) {
                throw new Error('Beta distribution values should be in [0, 1]')
              }
              
              setSamples(prev => ({ ...prev, beta: values }))
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test BetaDistribution
          </button>

          <button
            onClick={() => runTest('CategoricalDistribution', async () => {
              const dist = new CategoricalDistribution([
                { value: 'A', probability: 0.5 },
                { value: 'B', probability: 0.3 },
                { value: 'C', probability: 0.2 },
              ])
              
              const values = dist.sampleMany(1000)
              
              if (values.length !== 1000) {
                throw new Error('Should generate 1000 samples')
              }
              
              // Count occurrences
              const counts = values.reduce((acc, val) => {
                acc[val] = (acc[val] || 0) + 1
                return acc
              }, {} as Record<string, number>)
              
              // Check probabilities are roughly correct
              const aRatio = counts.A / 1000
              const bRatio = counts.B / 1000
              const cRatio = counts.C / 1000
              
              if (Math.abs(aRatio - 0.5) > 0.1) {
                throw new Error(`A probability ${aRatio} too far from 0.5`)
              }
              if (Math.abs(bRatio - 0.3) > 0.1) {
                throw new Error(`B probability ${bRatio} too far from 0.3`)
              }
              if (Math.abs(cRatio - 0.2) > 0.1) {
                throw new Error(`C probability ${cRatio} too far from 0.2`)
              }
              
              console.log('Categorical distribution counts:', counts)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test CategoricalDistribution
          </button>

          <button
            onClick={() => runTest('SeedManager', async () => {
              // Test seed reproducibility
              SeedManager.setSeed('test', 42)
              const dist1 = new NormalDistribution(0, 1)
              const values1 = dist1.sampleMany(10)
              
              SeedManager.setSeed('test', 42)
              const dist2 = new NormalDistribution(0, 1)
              const values2 = dist2.sampleMany(10)
              
              // Should produce identical values with same seed
              for (let i = 0; i < 10; i++) {
                if (values1[i] !== values2[i]) {
                  throw new Error('Same seed should produce identical values')
                }
              }
              
              SeedManager.reset()
              console.log('Seed manager working correctly')
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test SeedManager
          </button>

          {Object.keys(samples).length > 0 && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h4 className="font-semibold mb-2">Sample Statistics:</h4>
              {Object.entries(samples).map(([name, values]) => {
                const mean = values.reduce((a, b) => a + b) / values.length
                const min = Math.min(...values)
                const max = Math.max(...values)
                
                return (
                  <div key={name} className="mb-2 text-sm">
                    <strong>{name}:</strong> mean={mean.toFixed(2)}, 
                    min={min.toFixed(2)}, max={max.toFixed(2)}, 
                    n={values.length}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </TestWrapper>
  )
}