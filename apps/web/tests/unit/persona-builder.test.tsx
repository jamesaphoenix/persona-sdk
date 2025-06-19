import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PersonaBuilderComponent } from '@/components/persona-builder'

describe('PersonaBuilderComponent', () => {
  it('renders the form with all fields', () => {
    render(<PersonaBuilderComponent />)
    
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Age')).toBeInTheDocument()
    expect(screen.getByLabelText('Location')).toBeInTheDocument()
    expect(screen.getByText('Create Persona')).toBeInTheDocument()
  })

  it('creates a persona with default values', async () => {
    const user = userEvent.setup()
    render(<PersonaBuilderComponent />)
    
    const createButton = screen.getByText('Create Persona')
    await user.click(createButton)
    
    await waitFor(() => {
      const output = screen.getByText(/Created Persona/i)
      expect(output).toBeInTheDocument()
    })
    
    // Check the JSON output contains expected fields
    const jsonOutput = screen.getByText((content, element) => {
      return element?.tagName === 'PRE' && content.includes('"name": "Anonymous"')
    })
    expect(jsonOutput).toBeInTheDocument()
  })

  it('creates a persona with custom values', async () => {
    const user = userEvent.setup()
    render(<PersonaBuilderComponent />)
    
    // Fill in the form
    const nameInput = screen.getByLabelText('Name')
    const ageInput = screen.getByLabelText('Age')
    const locationInput = screen.getByLabelText('Location')
    
    await user.clear(nameInput)
    await user.type(nameInput, 'John Doe')
    
    await user.clear(ageInput)
    await user.type(ageInput, '30')
    
    await user.clear(locationInput)
    await user.type(locationInput, 'New York')
    
    // Create persona
    const createButton = screen.getByText('Create Persona')
    await user.click(createButton)
    
    // Verify output
    await waitFor(() => {
      const jsonOutput = screen.getByText((content, element) => {
        return element?.tagName === 'PRE' && 
               content.includes('"name": "John Doe"') &&
               content.includes('"age": 30') &&
               content.includes('"location": "New York"')
      })
      expect(jsonOutput).toBeInTheDocument()
    })
  })

  it('handles validation errors gracefully', async () => {
    const user = userEvent.setup()
    render(<PersonaBuilderComponent />)
    
    // Set invalid age
    const ageInput = screen.getByLabelText('Age')
    await user.clear(ageInput)
    await user.type(ageInput, '-5')
    
    const createButton = screen.getByText('Create Persona')
    await user.click(createButton)
    
    // Should still create persona but might show warning
    await waitFor(() => {
      const output = screen.getByText(/Created Persona/i)
      expect(output).toBeInTheDocument()
    })
  })

  it('updates age input correctly', async () => {
    const user = userEvent.setup()
    render(<PersonaBuilderComponent />)
    
    const ageInput = screen.getByLabelText('Age') as HTMLInputElement
    
    await user.clear(ageInput)
    await user.type(ageInput, '45')
    
    expect(ageInput.value).toBe('45')
  })

  it('preserves form data between persona creations', async () => {
    const user = userEvent.setup()
    render(<PersonaBuilderComponent />)
    
    // First creation
    const nameInput = screen.getByLabelText('Name')
    await user.type(nameInput, 'First Person')
    
    const createButton = screen.getByText('Create Persona')
    await user.click(createButton)
    
    // Verify first persona
    await waitFor(() => {
      expect(screen.getByText(/Created Persona/i)).toBeInTheDocument()
    })
    
    // Create second persona with same form data
    await user.click(createButton)
    
    // Form values should be preserved
    expect((nameInput as HTMLInputElement).value).toBe('First Person')
  })
})