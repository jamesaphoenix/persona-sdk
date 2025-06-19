'use client'

import { useState } from 'react'
import { 
  NormalDistribution,
  UniformDistribution,
  ExponentialDistribution,
  BinomialDistribution,
  PersonaBuilder
} from '@jamesaphoenix/persona-sdk'
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
    let distribution: any
    
    switch (distributionType) {
      case 'normal':
        distribution = new NormalDistribution(normalMean, normalStdDev)
        break
      case 'uniform':
        distribution = new UniformDistribution(uniformMin, uniformMax)
        break
      case 'exponential':
        distribution = new ExponentialDistribution(exponentialLambda)
        break
      case 'binomial':
        distribution = new BinomialDistribution(binomialN, binomialP)
        break
    }
    
    const newSamples = Array.from({ length: 20 }, () => distribution.sample())
    setSamples(newSamples)
    setStats({
      mean: distribution.mean(),
      variance: distribution.variance()
    })
  }

  const createPersonaWithDistribution = () => {
    let distribution: any
    
    switch (distributionType) {
      case 'normal':
        distribution = new NormalDistribution(30, 5)
        break
      case 'uniform':
        distribution = new UniformDistribution(20, 60)
        break
      case 'exponential':
        distribution = new ExponentialDistribution(0.05)
        break
      case 'binomial':
        distribution = new BinomialDistribution(50, 0.6)
        break
    }
    
    const persona = PersonaBuilder.create()
      .withName('Statistical Person')
      .withDistribution('age', distribution)
      .build()
    
    alert(`Created persona with age: ${persona.age}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Statistical Distributions</h1>
        <p className="text-gray-600">
          Explore different statistical distributions and their properties
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