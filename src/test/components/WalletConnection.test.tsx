/**
 * Tests for WalletConnection component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WalletConnection } from '@/components/WalletConnection'
import { WalletAccount } from '@/types'

// Mock PolkadotService
vi.mock('@/services/polkadotService', () => ({
  PolkadotService: vi.fn(() => ({
    initialize: vi.fn(),
    connectWallet: vi.fn(() => Promise.resolve([
      {
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        meta: { name: 'Test Account', source: 'polkadot-js' }
      }
    ])),
    getBalance: vi.fn(() => Promise.resolve('1000000000000'))
  }))
}))

describe('WalletConnection', () => {
  const mockOnAccountChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render connect wallet button when no account connected', () => {
    render(<WalletConnection onAccountChange={mockOnAccountChange} />)
    
    expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument()
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
    expect(screen.getByText('Requires Polkadot.js browser extension')).toBeInTheDocument()
  })

  it('should show connecting state when connecting', async () => {
    render(<WalletConnection onAccountChange={mockOnAccountChange} />)
    
    const connectButton = screen.getByText('Connect Wallet')
    fireEvent.click(connectButton)
    
    expect(screen.getByText('Connecting...')).toBeInTheDocument()
  })

  it('should display account info when connected', async () => {
    const { PolkadotService } = await import('@/services/polkadotService')
    const mockService = new PolkadotService()
    
    render(<WalletConnection onAccountChange={mockOnAccountChange} />)
    
    const connectButton = screen.getByText('Connect Wallet')
    fireEvent.click(connectButton)
    
    await waitFor(() => {
      expect(screen.getByText('Wallet Connected')).toBeInTheDocument()
    })
    
    expect(screen.getByText('5GrwvaEF...KutQY')).toBeInTheDocument()
    expect(screen.getByText('Test Account')).toBeInTheDocument()
    expect(screen.getByText('Asset Hub Westend (Testnet)')).toBeInTheDocument()
  })

  it('should call onAccountChange when account is selected', async () => {
    render(<WalletConnection onAccountChange={mockOnAccountChange} />)
    
    const connectButton = screen.getByText('Connect Wallet')
    fireEvent.click(connectButton)
    
    await waitFor(() => {
      expect(mockOnAccountChange).toHaveBeenCalledWith({
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        meta: { name: 'Test Account', source: 'polkadot-js' }
      })
    })
  })

  it('should handle disconnect', async () => {
    render(<WalletConnection onAccountChange={mockOnAccountChange} />)
    
    // First connect
    const connectButton = screen.getByText('Connect Wallet')
    fireEvent.click(connectButton)
    
    await waitFor(() => {
      expect(screen.getByText('Wallet Connected')).toBeInTheDocument()
    })
    
    // Then disconnect
    const disconnectButton = screen.getByTitle('Disconnect Wallet')
    fireEvent.click(disconnectButton)
    
    expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument()
    expect(mockOnAccountChange).toHaveBeenCalledWith(null)
  })
})