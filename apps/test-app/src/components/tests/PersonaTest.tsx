'use client'

import { PersonaBuilder, Persona } from '@jamesaphoenix/persona-sdk'
import { TestWrapper } from '../TestWrapper'
import { useState } from 'react'

export function PersonaTest() {
  const [lastPersona, setLastPersona] = useState<any>(null)

  return (
    <TestWrapper title="Persona & PersonaBuilder Tests" className="PersonaBuilder">
      {({ runTest }) => (
        <>
          <button
            onClick={() => runTest('create', async () => {
              const builder = PersonaBuilder.create()
              if (!builder) throw new Error('Failed to create PersonaBuilder')
              console.log('PersonaBuilder created successfully')
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test PersonaBuilder.create()
          </button>

          <button
            onClick={() => runTest('withName', async () => {
              const persona = PersonaBuilder.create()
                .withName('John Doe')
                .build()
              
              if (persona.name !== 'John Doe') {
                throw new Error(`Expected name 'John Doe', got '${persona.name}'`)
              }
              setLastPersona(persona)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test withName()
          </button>

          <button
            onClick={() => runTest('withAge', async () => {
              const persona = PersonaBuilder.create()
                .withAge(30)
                .build()
              
              if (persona.attributes.age !== 30) {
                throw new Error(`Expected age 30, got ${persona.attributes.age}`)
              }
              setLastPersona(persona)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test withAge()
          </button>

          <button
            onClick={() => runTest('withOccupation', async () => {
              const persona = PersonaBuilder.create()
                .withOccupation('Software Engineer')
                .build()
              
              if (persona.attributes.occupation !== 'Software Engineer') {
                throw new Error(`Expected occupation 'Software Engineer', got '${persona.attributes.occupation}'`)
              }
              setLastPersona(persona)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test withOccupation()
          </button>

          <button
            onClick={() => runTest('withSex', async () => {
              const persona = PersonaBuilder.create()
                .withSex('female')
                .build()
              
              if (persona.attributes.sex !== 'female') {
                throw new Error(`Expected sex 'female', got '${persona.attributes.sex}'`)
              }
              setLastPersona(persona)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test withSex()
          </button>

          <button
            onClick={() => runTest('withAttribute', async () => {
              const persona = PersonaBuilder.create()
                .withAttribute('city', 'New York')
                .withAttribute('skills', ['TypeScript', 'React'])
                .build()
              
              if (persona.attributes.city !== 'New York') {
                throw new Error(`Expected city 'New York', got '${persona.attributes.city}'`)
              }
              
              const skills = persona.attributes.skills as string[]
              if (!Array.isArray(skills) || skills.length !== 2) {
                throw new Error('Expected skills to be array of length 2')
              }
              setLastPersona(persona)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test withAttribute()
          </button>

          <button
            onClick={() => runTest('build', async () => {
              const persona = PersonaBuilder.create()
                .withName('Jane Smith')
                .withAge(28)
                .withOccupation('Data Scientist')
                .withSex('female')
                .withAttribute('location', 'San Francisco')
                .build()
              
              if (!persona.id) throw new Error('Persona missing ID')
              if (!persona.name) throw new Error('Persona missing name')
              if (typeof persona.attributes !== 'object') {
                throw new Error('Persona attributes should be an object')
              }
              
              console.log('Built persona:', persona)
              setLastPersona(persona)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test build() - Complete Persona
          </button>

          <button
            onClick={() => runTest('randomPersona', async () => {
              const persona = PersonaBuilder.create().randomPersona()
              
              if (!persona.id) throw new Error('Random persona missing ID')
              if (!persona.name) throw new Error('Random persona missing name')
              if (!persona.attributes.age) throw new Error('Random persona missing age')
              if (!persona.attributes.occupation) throw new Error('Random persona missing occupation')
              if (!persona.attributes.sex) throw new Error('Random persona missing sex')
              
              console.log('Random persona:', persona)
              setLastPersona(persona)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test randomPersona()
          </button>

          <button
            onClick={() => runTest('Persona constructor', async () => {
              const attributes = {
                age: 35,
                occupation: 'Manager',
                sex: 'male' as const,
                department: 'Sales'
              }
              
              const persona = new Persona('Bob Johnson', attributes)
              
              if (persona.name !== 'Bob Johnson') {
                throw new Error(`Expected name 'Bob Johnson', got '${persona.name}'`)
              }
              if (persona.attributes.age !== 35) {
                throw new Error(`Expected age 35, got ${persona.attributes.age}`)
              }
              
              setLastPersona(persona)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test Persona constructor
          </button>

          {lastPersona && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h4 className="font-semibold mb-2">Last Created Persona:</h4>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(lastPersona, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </TestWrapper>
  )
}