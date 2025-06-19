'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Trash2 } from 'lucide-react'

export function PersonaGroupComponent() {
  const [personas, setPersonas] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)

  const addRandomPersona = () => {
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']
    const locations = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney']
    
    const persona = {
      id: `persona-${Date.now()}-${Math.random()}`,
      name: names[Math.floor(Math.random() * names.length)],
      age: 20 + Math.floor(Math.random() * 40),
      sex: 'other',
      attributes: {
        occupation: locations[Math.floor(Math.random() * locations.length)]
      }
    }
    
    setPersonas(prev => [...prev, persona])
  }

  const removePersona = (index: number) => {
    setPersonas(prev => prev.filter((_, i) => i !== index))
  }

  const generateStats = () => {
    if (personas.length === 0) {
      setStats({ message: 'No personas to analyze' })
      return
    }
    
    const ages = personas.map(p => p.age)
    const statistics = {
      count: personas.length,
      ages: {
        min: Math.min(...ages),
        max: Math.max(...ages),
        average: ages.reduce((a, b) => a + b, 0) / ages.length
      },
      occupations: personas.reduce((acc, p) => {
        const occ = p.attributes.occupation
        acc[occ] = (acc[occ] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
    setStats(statistics)
  }

  const clearAll = () => {
    setPersonas([])
    setStats(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Persona Group Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={addRandomPersona}>Add Random Persona</Button>
            <Button onClick={generateStats} variant="secondary">
              Generate Statistics
            </Button>
            <Button onClick={clearAll} variant="destructive">
              Clear All
            </Button>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Total personas: {personas.length}
          </div>
        </CardContent>
      </Card>

      {personas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Personas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {personas.map((persona, index) => (
                <div
                  key={persona.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div>
                    <span className="font-medium">{persona.name}</span>
                    <span className="text-gray-600 ml-2">
                      Age: {persona.age}, Occupation: {persona.attributes.occupation}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removePersona(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(stats, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}