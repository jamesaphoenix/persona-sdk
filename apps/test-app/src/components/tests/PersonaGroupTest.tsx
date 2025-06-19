'use client'

import {
  PersonaGroup,
  PersonaBuilder,
  NormalDistribution,
  UniformDistribution,
  CategoricalDistribution,
} from '@jamesaphoenix/persona-sdk'
import { TestWrapper } from '../TestWrapper'
import { useState } from 'react'

export function PersonaGroupTest() {
  const [lastGroup, setLastGroup] = useState<PersonaGroup<any> | null>(null)

  return (
    <TestWrapper title="PersonaGroup Tests" className="PersonaGroup">
      {({ runTest }) => (
        <>
          <button
            onClick={() => runTest('constructor', async () => {
              const group = new PersonaGroup('Test Group')
              
              if (group.name !== 'Test Group') {
                throw new Error(`Expected name 'Test Group', got '${group.name}'`)
              }
              
              if (group.size !== 0) {
                throw new Error(`Expected size 0, got ${group.size}`)
              }
              
              setLastGroup(group)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test PersonaGroup constructor
          </button>

          <button
            onClick={() => runTest('add', async () => {
              const group = new PersonaGroup('Add Test')
              const persona = PersonaBuilder.create()
                .withName('Test Person')
                .withAge(30)
                .build()
              
              group.add(persona)
              
              if (group.size !== 1) {
                throw new Error(`Expected size 1 after add, got ${group.size}`)
              }
              
              if (group.personas[0].name !== 'Test Person') {
                throw new Error('Persona not added correctly')
              }
              
              setLastGroup(group)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test add()
          </button>

          <button
            onClick={() => runTest('remove', async () => {
              const group = new PersonaGroup('Remove Test')
              const persona1 = PersonaBuilder.create().withName('Person 1').build()
              const persona2 = PersonaBuilder.create().withName('Person 2').build()
              
              group.add(persona1)
              group.add(persona2)
              
              const removed = group.remove(persona1.name)
              
              if (!removed) {
                throw new Error('remove() should return true when persona exists')
              }
              
              if (group.size !== 1) {
                throw new Error(`Expected size 1 after remove, got ${group.size}`)
              }
              
              if (group.personas[0].name !== 'Person 2') {
                throw new Error('Wrong persona removed')
              }
              
              const removedAgain = group.remove(persona1.name)
              if (removedAgain) {
                throw new Error('remove() should return false for non-existent persona')
              }
              
              setLastGroup(group)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test remove()
          </button>

          <button
            onClick={() => runTest('clear', async () => {
              const group = new PersonaGroup('Clear Test')
              
              // Add multiple personas
              for (let i = 0; i < 5; i++) {
                group.add(PersonaBuilder.create().withName(`Person ${i}`).build())
              }
              
              const expectedSize = 5;
              if (group.size !== expectedSize) {
                throw new Error(`Setup failed: expected ${expectedSize}, got ${group.size}`)
              }
              
              group.clear()
              
              const currentSize: number = group.size;
              if (currentSize !== 0) {
                throw new Error(`Expected size 0 after clear, got ${currentSize}`)
              }
              
              if (group.personas.length !== 0) {
                throw new Error('Personas array should be empty')
              }
              
              setLastGroup(group)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test clear()
          </button>

          <button
            onClick={() => runTest('generateFromDistributions', async () => {
              const group = new PersonaGroup('Distribution Test')
              
              group.generateFromDistributions(50, {
                age: new NormalDistribution(35, 10),
                occupation: new CategoricalDistribution([
                  { value: 'Engineer', probability: 0.6 },
                  { value: 'Designer', probability: 0.4 },
                ]),
                sex: 'other',
                salary: new UniformDistribution(50000, 120000),
              })
              
              if (group.size !== 50) {
                throw new Error(`Expected 50 personas, got ${group.size}`)
              }
              
              // Check age distribution
              const ages = group.personas.map(p => p.attributes.age)
              const avgAge = ages.reduce((a, b) => a + b) / ages.length
              
              if (Math.abs(avgAge - 35) > 3) {
                throw new Error(`Average age ${avgAge} too far from expected 35`)
              }
              
              // Check occupation distribution
              const occupations = group.personas.map(p => p.attributes.occupation)
              const engineerCount = occupations.filter(o => o === 'Engineer').length
              const engineerRatio = engineerCount / 50
              
              if (Math.abs(engineerRatio - 0.6) > 0.15) {
                throw new Error(`Engineer ratio ${engineerRatio} too far from 0.6`)
              }
              
              setLastGroup(group)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test generateFromDistributions()
          </button>

          <button
            onClick={() => runTest('getStatistics', async () => {
              const group = new PersonaGroup('Stats Test')
              
              group.generateFromDistributions(100, {
                age: new NormalDistribution(40, 5),
                occupation: 'Analyst',
                sex: 'other',
                score: new UniformDistribution(0, 100),
              })
              
              const ageStats = group.getStatistics('age')
              
              if (!ageStats.mean || Math.abs(ageStats.mean - 40) > 2) {
                throw new Error(`Mean age ${ageStats.mean} too far from expected 40`)
              }
              
              if (!ageStats.stdDev || ageStats.stdDev < 3 || ageStats.stdDev > 7) {
                throw new Error(`StdDev ${ageStats.stdDev} outside expected range`)
              }
              
              if (ageStats.count !== 100) {
                throw new Error(`Count should be 100, got ${ageStats.count}`)
              }
              
              const scoreStats = group.getStatistics('score')
              
              if (!scoreStats.min || scoreStats.min < 0) {
                throw new Error('Min score should be >= 0')
              }
              
              if (!scoreStats.max || scoreStats.max > 100) {
                throw new Error('Max score should be <= 100')
              }
              
              console.log('Age stats:', ageStats)
              console.log('Score stats:', scoreStats)
              
              setLastGroup(group)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test getStatistics()
          </button>

          <button
            onClick={() => runTest('PersonaGroup.generate', async () => {
              const group = await PersonaGroup.generate({
                size: 25,
                segments: [{
                  weight: 1.0,
                  attributes: {
                    age: new NormalDistribution(28, 6),
                    occupation: new CategoricalDistribution([
                      { value: 'Developer', probability: 0.5 },
                      { value: 'Manager', probability: 0.3 },
                    { value: 'Designer', probability: 0.2 },
                  ]),
                  sex: 'other',
                  experience: new UniformDistribution(1, 10),
                  }
                }]
              })
              
              if (group.size !== 25) {
                throw new Error(`Expected 25 personas, got ${group.size}`)
              }
              
              if (!group.name.includes('Generated')) {
                throw new Error('Generated group should have default name')
              }
              
              // Verify all personas have required attributes
              for (const persona of group.personas) {
                if (!persona.attributes.age || !persona.attributes.occupation) {
                  throw new Error('Persona missing required attributes')
                }
              }
              
              setLastGroup(group)
            })}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded"
          >
            Test PersonaGroup.generate() static method
          </button>

          {lastGroup && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h4 className="font-semibold mb-2">Last PersonaGroup:</h4>
              <div className="text-sm space-y-1">
                <p><strong>Name:</strong> {lastGroup.name}</p>
                <p><strong>Size:</strong> {lastGroup.size}</p>
                {lastGroup.size > 0 && (
                  <>
                    <p><strong>First 3 personas:</strong></p>
                    <pre className="text-xs overflow-auto mt-2">
                      {JSON.stringify(lastGroup.personas.slice(0, 3), null, 2)}
                    </pre>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </TestWrapper>
  )
}