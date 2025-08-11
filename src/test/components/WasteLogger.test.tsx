/**
 * Tests for WasteLogger component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WasteLogger } from '@/components/WasteLogger'

describe('WasteLogger', () => {
  const mockOnLogWaste = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render waste logger form', () => {
    render(<WasteLogger onLogWaste={mockOnLogWaste} />)
    
    expect(screen.getByText('Log Food Waste Reduction')).toBeInTheDocument()
    expect(screen.getByLabelText('Amount (grams)')).toBeInTheDocument()
    expect(screen.getByLabelText('Action Type')).toBeInTheDocument()
    expect(screen.getByLabelText('Description (optional)')).toBeInTheDocument()
  })

  it('should show estimated impact when amount is entered', async () => {
    const user = userEvent.setup()
    render(<WasteLogger onLogWaste={mockOnLogWaste} />)
    
    const amountInput = screen.getByLabelText('Amount (grams)')
    await user.type(amountInput, '1000')
    
    expect(screen.getByText('Estimated Impact')).toBeInTheDocument()
    expect(screen.getByText('10 FWT')).toBeInTheDocument() // 1kg = 10 tokens
    expect(screen.getByText('2.50 kg')).toBeInTheDocument() // 1kg = 2.5kg CO2
  })

  it('should submit form with correct data', async () => {
    const user = userEvent.setup()
    mockOnLogWaste.mockResolvedValue(undefined)
    
    render(<WasteLogger onLogWaste={mockOnLogWaste} />)
    
    // Fill form
    await user.type(screen.getByLabelText('Amount (grams)'), '500')
    await user.selectOptions(screen.getByLabelText('Action Type'), 'donation')
    await user.type(screen.getByLabelText('Description (optional)'), 'Donated to food bank')
    
    // Submit
    await user.click(screen.getByText('Log Waste Reduction'))
    
    await waitFor(() => {
      expect(mockOnLogWaste).toHaveBeenCalledWith({
        amount: 500,
        actionType: 'donation',
        description: 'Donated to food bank'
      })
    })
  })

  it('should show success message after successful submission', async () => {
    const user = userEvent.setup()
    mockOnLogWaste.mockResolvedValue(undefined)
    
    render(<WasteLogger onLogWaste={mockOnLogWaste} />)
    
    await user.type(screen.getByLabelText('Amount (grams)'), '250')
    await user.click(screen.getByText('Log Waste Reduction'))
    
    await waitFor(() => {
      expect(screen.getByText('Waste reduction logged successfully!')).toBeInTheDocument()
    })
  })

  it('should handle submission errors', async () => {
    const user = userEvent.setup()
    mockOnLogWaste.mockRejectedValue(new Error('Network error'))
    
    // Mock alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    render(<WasteLogger onLogWaste={mockOnLogWaste} />)
    
    await user.type(screen.getByLabelText('Amount (grams)'), '250')
    await user.click(screen.getByText('Log Waste Reduction'))
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to log waste reduction. Please try again.')
    })
    
    alertSpy.mockRestore()
  })

  it('should use quick actions', async () => {
    const user = userEvent.setup()
    render(<WasteLogger onLogWaste={mockOnLogWaste} />)
    
    // Click quick action
    await user.click(screen.getByText('250g - Donated food'))
    
    expect(screen.getByDisplayValue('250')).toBeInTheDocument()
    expect(screen.getByDisplayValue('donation')).toBeInTheDocument()
  })

  it('should disable submit button when amount is invalid', () => {
    render(<WasteLogger onLogWaste={mockOnLogWaste} />)
    
    const submitButton = screen.getByText('Log Waste Reduction')
    expect(submitButton).toBeDisabled()
  })

  it('should show loading state during submission', async () => {
    const user = userEvent.setup()
    mockOnLogWaste.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
    
    render(<WasteLogger onLogWaste={mockOnLogWaste} />)
    
    await user.type(screen.getByLabelText('Amount (grams)'), '250')
    await user.click(screen.getByText('Log Waste Reduction'))
    
    expect(screen.getByText('Logging Waste Reduction...')).toBeInTheDocument()
  })
})