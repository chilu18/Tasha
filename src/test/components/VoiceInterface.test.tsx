/**
 * Tests for VoiceInterface component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VoiceInterface } from '@/components/VoiceInterface'
import { VoiceCommand } from '@/types'

describe('VoiceInterface', () => {
  const mockOnCommand = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render voice interface', () => {
    render(<VoiceInterface onCommand={mockOnCommand} />)
    
    expect(screen.getByText('Hey Tasha! 🥗')).toBeInTheDocument()
    expect(screen.getByText('Your AI voice assistant for food waste tracking')).toBeInTheDocument()
  })

  it('should show microphone and speaker buttons', () => {
    render(<VoiceInterface onCommand={mockOnCommand} />)
    
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2) // Mic and speaker buttons
  })

  it('should disable buttons when processing', () => {
    render(<VoiceInterface onCommand={mockOnCommand} isProcessing={true} />)
    
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toBeDisabled() // Mic button should be disabled
  })

  it('should display usage examples', () => {
    render(<VoiceInterface onCommand={mockOnCommand} />)
    
    expect(screen.getByText('Try saying:')).toBeInTheDocument()
    expect(screen.getByText('"Log 200 grams of food waste"')).toBeInTheDocument()
    expect(screen.getByText('"Check my balance"')).toBeInTheDocument()
  })

  it('should show processing state', () => {
    render(<VoiceInterface onCommand={mockOnCommand} isProcessing={true} />)
    
    expect(screen.getByText('🤖 Processing...')).toBeInTheDocument()
  })

  // Note: Testing actual speech recognition would require more complex mocking
  // of the Web Speech API, which is beyond the scope of this basic test
})