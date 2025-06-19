import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { PersonaGroup, PersonaBuilder } from '@jamesaphoenix/persona-sdk'

// Component to test PersonaGroup functionality
function TestPersonaGroup() {
  const [group] = useState(() => new PersonaGroup())
  const [personas, setPersonas] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)

  const addPersona = () => {
    const persona = PersonaBuilder.create()
      .withName(`Person ${personas.length + 1}`)
      .withAge(20 + Math.floor(Math.random() * 40))
      .build()
    
    group.add(persona)
    setPersonas([...group.getAll()])
  }

  const generateStats = () => {
    const statistics = group.generateStatistics()
    setStats(statistics)
  }

  return (
    <div>
      <button onClick={addPersona}>Add Persona</button>
      <button onClick={generateStats}>Generate Statistics</button>
      
      <div data-testid="persona-count">{personas.length} personas</div>
      
      {personas.map((persona, i) => (
        <div key={i} data-testid={`persona-${i}`}>
          {persona.name} - Age: {persona.age}
        </div>
      ))}
      
      {stats && (
        <div data-testid="statistics">
          <pre>{JSON.stringify(stats, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

describe('PersonaGroup Integration', () => {
  it('adds personas to the group', async () => {
    const user = userEvent.setup()
    render(<TestPersonaGroup />)
    
    // Initially no personas
    expect(screen.getByTestId('persona-count')).toHaveTextContent('0 personas')
    
    // Add first persona
    await user.click(screen.getByText('Add Persona'))
    
    await waitFor(() => {
      expect(screen.getByTestId('persona-count')).toHaveTextContent('1 personas')
      expect(screen.getByTestId('persona-0')).toBeInTheDocument()
    })
    
    // Add second persona
    await user.click(screen.getByText('Add Persona'))
    
    await waitFor(() => {
      expect(screen.getByTestId('persona-count')).toHaveTextContent('2 personas')
      expect(screen.getByTestId('persona-1')).toBeInTheDocument()
    })
  })

  it('generates statistics for the group', async () => {
    const user = userEvent.setup()
    render(<TestPersonaGroup />)
    
    // Add multiple personas
    const addButton = screen.getByText('Add Persona')
    await user.click(addButton)
    await user.click(addButton)
    await user.click(addButton)
    
    // Generate statistics
    await user.click(screen.getByText('Generate Statistics'))
    
    await waitFor(() => {
      const stats = screen.getByTestId('statistics')
      expect(stats).toBeInTheDocument()
      
      // Check that statistics contain expected structure
      const statsText = stats.textContent || ''
      expect(statsText).toContain('count')
      expect(statsText).toContain('3')
    })
  })

  it('maintains persona details correctly', async () => {
    const user = userEvent.setup()
    render(<TestPersonaGroup />)
    
    // Add personas
    await user.click(screen.getByText('Add Persona'))
    await user.click(screen.getByText('Add Persona'))
    
    await waitFor(() => {
      const persona1 = screen.getByTestId('persona-0')
      const persona2 = screen.getByTestId('persona-1')
      
      expect(persona1).toHaveTextContent('Person 1')
      expect(persona2).toHaveTextContent('Person 2')
      
      // Check ages are present
      expect(persona1.textContent).toMatch(/Age: \d+/)
      expect(persona2.textContent).toMatch(/Age: \d+/)
    })
  })
})