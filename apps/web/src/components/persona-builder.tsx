'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

export function PersonaBuilderComponent() {
  const [name, setName] = useState('')
  const [age, setAge] = useState(25)
  const [location, setLocation] = useState('')
  const [persona, setPersona] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const createPersona = () => {
    try {
      const newPersona = {
        id: `persona-${Date.now()}`,
        name: name || 'Anonymous',
        age: age,
        occupation: location || 'Unknown',
        sex: 'other',
        attributes: {
          created_at: new Date().toISOString(),
          builder_type: 'demo'
        }
      }
      
      setPersona(newPersona)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create persona')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Persona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
            />
          </div>
          
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              min={0}
              max={150}
            />
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
            />
          </div>
          
          <Button onClick={createPersona} className="w-full">
            Create Persona
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {persona && (
        <Card>
          <CardHeader>
            <CardTitle>Created Persona</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(persona, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}