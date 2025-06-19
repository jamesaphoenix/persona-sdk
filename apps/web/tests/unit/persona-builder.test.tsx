import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PersonaBuilderComponent } from '@/components/persona-builder'

// Use actual PersonaBuilder for this component test
vi.mock('@jamesaphoenix/persona-sdk', async () => {
  const actual = await vi.importActual('@jamesaphoenix/persona-sdk')
  return {
    ...actual,
    PersonaBuilder: actual.PersonaBuilder
  }
})

describe('PersonaBuilderComponent', () => {
  it('renders the form with all fields', () => {
    render(<PersonaBuilderComponent />)
    
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Age')).toBeInTheDocument()
    expect(screen.getByLabelText('Location')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Persona' })).toBeInTheDocument()
  })

  it('creates a persona with default values', async () => {
    const user = userEvent.setup()
    render(<PersonaBuilderComponent />)
    
    const createButton = screen.getByRole('button', { name: 'Create Persona' })
    await user.click(createButton)
    
    await waitFor(() => {
      const output = screen.getByText(/Created Persona/i)
      expect(output).toBeInTheDocument()
    })
    
    // Check that the persona creation output is displayed
    await waitFor(() => {
      expect(screen.getByText(/Created Persona/i)).toBeInTheDocument()
    })
    
    // Check that a <pre> element exists (contains the JSON output)
    expect(document.querySelector('pre')).toBeInTheDocument()
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
    const createButton = screen.getByRole('button', { name: 'Create Persona' })
    await user.click(createButton)
    
    // Verify output
    await waitFor(() => {
      expect(screen.getByText(/Created Persona/i)).toBeInTheDocument()
    })
    
    // Check that output includes the name and age
    const preElement = document.querySelector('pre')
    expect(preElement).toBeInTheDocument()
    if (preElement) {
      expect(preElement.textContent).toContain('John Doe')
      expect(preElement.textContent).toContain('30')
    }
  })

  it('handles validation errors gracefully', async () => {
    const user = userEvent.setup()
    render(<PersonaBuilderComponent />)
    
    // Set invalid age
    const ageInput = screen.getByLabelText('Age')
    await user.clear(ageInput)
    await user.type(ageInput, '-5')
    
    const createButton = screen.getByRole('button', { name: 'Create Persona' })
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
    
    const createButton = screen.getByRole('button', { name: 'Create Persona' })
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