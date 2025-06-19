'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type DistributionType = 'normal' | 'uniform' | 'exponential' | 'binomial'

export default function DistributionsPage() {
  const [distributionType, setDistributionType] = useState<DistributionType>('normal')
  const [samples, setSamples] = useState<number[]>([])
  const [stats, setStats] = useState<{ mean: number; variance: number } | null>(null)
  
  // Normal distribution params
  const [normalMean, setNormalMean] = useState(100)
  const [normalStdDev, setNormalStdDev] = useState(15)
  
  // Uniform distribution params
  const [uniformMin, setUniformMin] = useState(0)
  const [uniformMax, setUniformMax] = useState(100)
  
  // Exponential distribution params
  const [exponentialLambda, setExponentialLambda] = useState(1)
  
  // Binomial distribution params
  const [binomialN, setBinomialN] = useState(10)
  const [binomialP, setBinomialP] = useState(0.5)

  const generateSamples = () => {
    let mockMean: number
    let mockVariance: number
    let mockSamples: number[]
    
    switch (distributionType) {
      case 'normal':
        mockMean = normalMean
        mockVariance = normalStdDev * normalStdDev
        mockSamples = Array.from({ length: 20 }, () => 
          normalMean + (Math.random() - 0.5) * normalStdDev * 2
        )
        break
      case 'uniform':
        mockMean = (uniformMin + uniformMax) / 2
        mockVariance = Math.pow(uniformMax - uniformMin, 2) / 12
        mockSamples = Array.from({ length: 20 }, () => 
          uniformMin + Math.random() * (uniformMax - uniformMin)
        )
        break
      case 'exponential':
        mockMean = 1 / exponentialLambda
        mockVariance = 1 / (exponentialLambda * exponentialLambda)
        mockSamples = Array.from({ length: 20 }, () => 
          -Math.log(Math.random()) / exponentialLambda
        )
        break
      case 'binomial':
        mockMean = binomialN * binomialP
        mockVariance = binomialN * binomialP * (1 - binomialP)
        mockSamples = Array.from({ length: 20 }, () => {
          let successes = 0
          for (let i = 0; i < binomialN; i++) {
            if (Math.random() < binomialP) successes++
          }
          return successes
        })
        break
      default:
        mockMean = 0
        mockVariance = 0
        mockSamples = []
    }
    
    setSamples(mockSamples)
    setStats({
      mean: mockMean,
      variance: mockVariance
    })
  }

  const createPersonaWithDistribution = () => {
    let sampleValue: number
    
    switch (distributionType) {
      case 'normal':
        sampleValue = 30 + (Math.random() - 0.5) * 10 // Age ~30 ±5
        break
      case 'uniform':
        sampleValue = 20 + Math.random() * 40 // Age 20-60
        break
      case 'exponential':
        sampleValue = -Math.log(Math.random()) / 0.05 // Exponential sample
        break
      case 'binomial':
        let successes = 0
        for (let i = 0; i < 50; i++) {
          if (Math.random() < 0.6) successes++
        }
        sampleValue = successes
        break
      default:
        sampleValue = 25
    }
    
    const persona = {
      id: `persona-${Date.now()}`,
      name: 'Statistical Person',
      age: Math.max(18, Math.round(distributionType === 'binomial' ? 25 : sampleValue)),
      occupation: 'Worker',
      sex: 'other'
    }
    
    alert(`Created persona: ${persona.name} (Age: ${persona.age}), Sample from ${distributionType} distribution: ${sampleValue.toFixed(2)}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Statistical Distributions</h1>
        <p className="text-gray-600">
          Demo statistical distributions with simulated sampling (actual SDK distributions tested in core suite)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribution Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Distribution Type</Label>
            <Select value={distributionType} onValueChange={(v) => setDistributionType(v as DistributionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal (Gaussian)</SelectItem>
                <SelectItem value="uniform">Uniform</SelectItem>
                <SelectItem value="exponential">Exponential</SelectItem>
                <SelectItem value="binomial">Binomial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {distributionType === 'normal' && (
            <>
              <div>
                <Label htmlFor="normal-mean">Mean (μ)</Label>
                <Input
                  id="normal-mean"
                  type="number"
                  value={normalMean}
                  onChange={(e) => setNormalMean(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="normal-stddev">Standard Deviation (σ)</Label>
                <Input
                  id="normal-stddev"
                  type="number"
                  value={normalStdDev}
                  onChange={(e) => setNormalStdDev(Number(e.target.value))}
                  min={0.1}
                />
              </div>
            </>
          )}

          {distributionType === 'uniform' && (
            <>
              <div>
                <Label htmlFor="uniform-min">Minimum</Label>
                <Input
                  id="uniform-min"
                  type="number"
                  value={uniformMin}
                  onChange={(e) => setUniformMin(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="uniform-max">Maximum</Label>
                <Input
                  id="uniform-max"
                  type="number"
                  value={uniformMax}
                  onChange={(e) => setUniformMax(Number(e.target.value))}
                />
              </div>
            </>
          )}

          {distributionType === 'exponential' && (
            <div>
              <Label htmlFor="exp-lambda">Lambda (λ)</Label>
              <Input
                id="exp-lambda"
                type="number"
                value={exponentialLambda}
                onChange={(e) => setExponentialLambda(Number(e.target.value))}
                min={0.01}
                step={0.1}
              />
            </div>
          )}

          {distributionType === 'binomial' && (
            <>
              <div>
                <Label htmlFor="binom-n">Number of Trials (n)</Label>
                <Input
                  id="binom-n"
                  type="number"
                  value={binomialN}
                  onChange={(e) => setBinomialN(Number(e.target.value))}
                  min={1}
                />
              </div>
              <div>
                <Label htmlFor="binom-p">Probability (p)</Label>
                <Input
                  id="binom-p"
                  type="number"
                  value={binomialP}
                  onChange={(e) => setBinomialP(Number(e.target.value))}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button onClick={generateSamples}>Generate Samples</Button>
            <Button onClick={createPersonaWithDistribution} variant="secondary">
              Create Persona
            </Button>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Distribution Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Expected Mean</p>
                <p className="text-lg font-semibold">{stats.mean.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expected Variance</p>
                <p className="text-lg font-semibold">{stats.variance.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {samples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sample Values (20 samples)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {samples.map((sample, index) => (
                <div
                  key={index}
                  className="bg-gray-100 p-2 rounded text-center text-sm"
                >
                  {sample.toFixed(2)}
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Sample Mean: {(samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(2)}</p>
              <p>Sample Min: {Math.min(...samples).toFixed(2)}</p>
              <p>Sample Max: {Math.max(...samples).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}