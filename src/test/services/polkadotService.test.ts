/**
 * Tests for PolkadotService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PolkadotService } from '@/services/polkadotService'

// Mock Polkadot API
vi.mock('@polkadot/api', () => ({
  ApiPromise: {
    create: vi.fn(() => Promise.resolve({
      query: {
        system: {
          account: vi.fn(() => Promise.resolve({
            data: { free: { toString: () => '1000000000000' } }
          }))
        }
      },
      disconnect: vi.fn()
    }))
  },
  WsProvider: vi.fn()
}))

vi.mock('@polkadot/extension-dapp', () => ({
  web3Enable: vi.fn(() => Promise.resolve([{ name: 'polkadot-js' }])),
  web3Accounts: vi.fn(() => Promise.resolve([
    {
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      meta: { name: 'Test Account', source: 'polkadot-js' }
    }
  ])),
  web3FromAddress: vi.fn()
}))

describe('PolkadotService', () => {
  let polkadotService: PolkadotService

  beforeEach(() => {
    polkadotService = new PolkadotService()
    vi.clearAllMocks()
  })

  describe('initialize', () => {
    it('should initialize connection successfully', async () => {
      await expect(polkadotService.initialize()).resolves.not.toThrow()
    })
  })

  describe('connectWallet', () => {
    it('should connect wallet and return accounts', async () => {
      const accounts = await polkadotService.connectWallet()
      
      expect(accounts).toHaveLength(1)
      expect(accounts[0]).toEqual({
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        meta: { name: 'Test Account', source: 'polkadot-js' }
      })
    })

    it('should throw error when no extension found', async () => {
      const { web3Enable } = await import('@polkadot/extension-dapp')
      ;(web3Enable as any).mockResolvedValueOnce([])

      await expect(polkadotService.connectWallet())
        .rejects.toThrow('No wallet extension found')
    })

    it('should throw error when no accounts found', async () => {
      const { web3Accounts } = await import('@polkadot/extension-dapp')
      ;(web3Accounts as any).mockResolvedValueOnce([])

      await expect(polkadotService.connectWallet())
        .rejects.toThrow('No accounts found')
    })
  })

  describe('getBalance', () => {
    it('should fetch account balance', async () => {
      await polkadotService.initialize()
      
      const balance = await polkadotService.getBalance('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY')
      
      expect(balance).toBe('1000000000000')
    })

    it('should throw error when API not initialized', async () => {
      await expect(polkadotService.getBalance('test-address'))
        .rejects.toThrow('API not initialized')
    })
  })

  describe('logWasteReduction', () => {
    it('should log waste reduction and return transaction hash', async () => {
      await polkadotService.initialize()
      
      const txHash = await polkadotService.logWasteReduction(
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        500,
        'donation'
      )
      
      expect(txHash).toMatch(/^0x[a-f0-9]{64}$/)
    })

    it('should throw error when API not initialized', async () => {
      await expect(polkadotService.logWasteReduction('test-address', 500, 'donation'))
        .rejects.toThrow('API not initialized')
    })
  })

  describe('calculateTokens', () => {
    it('should calculate tokens correctly', () => {
      expect(polkadotService.calculateTokens(1000)).toBe(10) // 1kg = 10 tokens
      expect(polkadotService.calculateTokens(500)).toBe(5)   // 0.5kg = 5 tokens
      expect(polkadotService.calculateTokens(100)).toBe(1)   // 0.1kg = 1 token
    })
  })

  describe('calculateCO2Prevented', () => {
    it('should calculate CO2 prevention correctly', () => {
      expect(polkadotService.calculateCO2Prevented(1000)).toBe(2.5) // 1kg = 2.5kg CO2
      expect(polkadotService.calculateCO2Prevented(500)).toBe(1.25)  // 0.5kg = 1.25kg CO2
      expect(polkadotService.calculateCO2Prevented(200)).toBe(0.5)   // 0.2kg = 0.5kg CO2
    })
  })

  describe('getWasteHistory', () => {
    it('should return mock waste history', async () => {
      const history = await polkadotService.getWasteHistory('test-address')
      
      expect(history).toHaveLength(2)
      expect(history[0]).toHaveProperty('amount', 500)
      expect(history[0]).toHaveProperty('actionType', 'donation')
      expect(history[0]).toHaveProperty('tokensEarned', 50)
    })
  })

  describe('disconnect', () => {
    it('should disconnect from network', async () => {
      await polkadotService.initialize()
      await expect(polkadotService.disconnect()).resolves.not.toThrow()
    })
  })
})