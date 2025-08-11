/**
 * Integration tests for waste logging flow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '@/app/page'

// Mock all services
vi.mock('@/services/polkadotService')
vi.mock('@/services/monzoService')
vi.mock('@/services/elevenLabsService')

describe('Waste Logging Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should complete full waste logging flow', async () => {
    const user = userEvent.setup()
    
    // Mock successful wallet connection
    const { PolkadotService } = await import('@/services/polkadotService')
    const mockPolkadotService = {
      initialize: vi.fn(),
      connectWallet: vi.fn(() => Promise.resolve([
        {
          address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          meta: { name: 'Test Account', source: 'polkadot-js' }
        }
      ])),
      getBalance: vi.fn(() => Promise.resolve('1000000000000')),
      logWasteReduction: vi.fn(() => Promise.resolve('0xabc123')),
      getWasteHistory: vi.fn(() => Promise.resolve([])),
      calculateTokens: vi.fn((amount) => Math.floor(amount / 100)),
      calculateCO2Prevented: vi.fn((amount) => amount * 0.0025)
    }
    
    vi.mocked(PolkadotService).mockImplementation(() => mockPolkadotService as any)
    
    render(<Home />)
    
    // 1. Connect wallet
    const connectButton = screen.getByText('Connect Wallet')
    await user.click(connectButton)
    
    await waitFor(() => {
      expect(screen.getByText('Wallet Connected')).toBeInTheDocument()
    })
    
    // 2. Navigate to log waste
    await user.click(screen.getByText('Log Waste'))
    
    // 3. Fill waste logging form
    await user.type(screen.getByLabelText('Amount (grams)'), '500')
    await user.selectOptions(screen.getByLabelText('Action Type'), 'donation')
    await user.type(screen.getByLabelText('Description (optional)'), 'Donated to local food bank')
    
    // 4. Submit form
    await user.click(screen.getByText('Log Waste Reduction'))
    
    // 5. Verify blockchain interaction
    await waitFor(() => {
      expect(mockPolkadotService.logWasteReduction).toHaveBeenCalledWith(
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        500,
        'donation'
      )
    })
    
    // 6. Verify success message
    expect(screen.getByText('Waste reduction logged successfully!')).toBeInTheDocument()
    
    // 7. Check dashboard updates
    await user.click(screen.getByText('Dashboard'))
    
    // Stats should be updated (this would require more complex state management in a real app)
    // For now, we just verify the dashboard renders
    expect(screen.getByText('Weekly Progress')).toBeInTheDocument()
  })

  it('should handle voice command for waste logging', async () => {
    const user = userEvent.setup()
    
    // Mock services
    const { PolkadotService } = await import('@/services/polkadotService')
    const { ElevenLabsService } = await import('@/services/elevenLabsService')
    
    const mockPolkadotService = {
      initialize: vi.fn(),
      connectWallet: vi.fn(() => Promise.resolve([
        {
          address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          meta: { name: 'Test Account', source: 'polkadot-js' }
        }
      ])),
      getBalance: vi.fn(() => Promise.resolve('1000000000000')),
      logWasteReduction: vi.fn(() => Promise.resolve('0xabc123')),
      getWasteHistory: vi.fn(() => Promise.resolve([])),
      calculateTokens: vi.fn((amount) => Math.floor(amount / 100)),
      calculateCO2Prevented: vi.fn((amount) => amount * 0.0025)
    }
    
    const mockElevenLabsService = {
      generateResponse: vi.fn(() => Promise.resolve({
        text: 'Great job! Waste logged successfully.',
        audioUrl: 'mock-audio-url'
      }))
    }
    
    vi.mocked(PolkadotService).mockImplementation(() => mockPolkadotService as any)
    vi.mocked(ElevenLabsService).mockImplementation(() => mockElevenLabsService as any)
    
    render(<Home />)
    
    // Connect wallet first
    await user.click(screen.getByText('Connect Wallet'))
    await waitFor(() => {
      expect(screen.getByText('Wallet Connected')).toBeInTheDocument()
    })
    
    // Navigate to voice interface
    await user.click(screen.getByText('Voice Assistant'))
    
    // Voice interface should be rendered
    expect(screen.getByText('Hey Tasha! 🥗')).toBeInTheDocument()
    
    // Note: Testing actual voice recognition would require more complex mocking
    // of the Web Speech API and would be better suited for E2E tests
  })

  it('should handle errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock service with error
    const { PolkadotService } = await import('@/services/polkadotService')
    const mockPolkadotService = {
      initialize: vi.fn(),
      connectWallet: vi.fn(() => Promise.resolve([
        {
          address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          meta: { name: 'Test Account', source: 'polkadot-js' }
        }
      ])),
      getBalance: vi.fn(() => Promise.resolve('1000000000000')),
      logWasteReduction: vi.fn(() => Promise.reject(new Error('Network error'))),
      getWasteHistory: vi.fn(() => Promise.resolve([])),
      calculateTokens: vi.fn((amount) => Math.floor(amount / 100)),
      calculateCO2Prevented: vi.fn((amount) => amount * 0.0025)
    }
    
    vi.mocked(PolkadotService).mockImplementation(() => mockPolkadotService as any)
    
    // Mock alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    render(<Home />)
    
    // Connect wallet
    await user.click(screen.getByText('Connect Wallet'))
    await waitFor(() => {
      expect(screen.getByText('Wallet Connected')).toBeInTheDocument()
    })
    
    // Try to log waste
    await user.click(screen.getByText('Log Waste'))
    await user.type(screen.getByLabelText('Amount (grams)'), '500')
    await user.click(screen.getByText('Log Waste Reduction'))
    
    // Should show error
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to log waste reduction. Please try again.')
    })
    
    alertSpy.mockRestore()
  })
})