/**
 * Tests for MonzoService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MonzoService } from '@/services/monzoService'

// Mock fetch
global.fetch = vi.fn()

describe('MonzoService', () => {
  let monzoService: MonzoService
  const mockAccessToken = 'test-access-token'

  beforeEach(() => {
    monzoService = new MonzoService(mockAccessToken)
    vi.clearAllMocks()
  })

  describe('fetchTransactions', () => {
    it('should fetch transactions successfully', async () => {
      const mockTransactions = [
        {
          id: 'tx_001',
          amount: -2350,
          currency: 'GBP',
          description: 'TESCO STORES',
          created: '2024-01-01T10:00:00Z',
          category: 'groceries'
        }
      ]

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ transactions: mockTransactions })
      })

      const result = await monzoService.fetchTransactions('acc_123')
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.monzo.com/transactions?account_id=acc_123&limit=100',
        {
          headers: {
            'Authorization': `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      expect(result).toEqual(mockTransactions)
    })

    it('should throw error when access token is missing', async () => {
      const serviceWithoutToken = new MonzoService()
      
      await expect(serviceWithoutToken.fetchTransactions('acc_123'))
        .rejects.toThrow('Monzo access token not provided')
    })

    it('should throw error on API failure', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      })

      await expect(monzoService.fetchTransactions('acc_123'))
        .rejects.toThrow('Monzo API error: 401 Unauthorized')
    })
  })

  describe('isFoodRelated', () => {
    it('should identify food transactions by category', async () => {
      const mockTransactions = [
        {
          id: 'tx_001',
          amount: -2350,
          currency: 'GBP',
          description: 'SOME STORE',
          category: 'groceries',
          created: '2024-01-01T10:00:00Z'
        },
        {
          id: 'tx_002',
          amount: -1000,
          currency: 'GBP',
          description: 'FUEL STATION',
          category: 'transport',
          created: '2024-01-01T10:00:00Z'
        }
      ]

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ transactions: mockTransactions })
      })

      const foodTransactions = await monzoService.getFoodTransactions('acc_123')
      
      expect(foodTransactions).toHaveLength(1)
      expect(foodTransactions[0].id).toBe('tx_001')
    })

    it('should identify food transactions by description keywords', async () => {
      const mockTransactions = [
        {
          id: 'tx_001',
          amount: -2350,
          currency: 'GBP',
          description: 'TESCO STORES 3297',
          category: 'general',
          created: '2024-01-01T10:00:00Z'
        }
      ]

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ transactions: mockTransactions })
      })

      const foodTransactions = await monzoService.getFoodTransactions('acc_123')
      
      expect(foodTransactions).toHaveLength(1)
      expect(foodTransactions[0].description).toContain('TESCO')
    })
  })

  describe('parseReceipt', () => {
    it('should parse receipt text and extract items', async () => {
      const receiptText = `
        Bread 2x £2.50
        Milk 1x £1.20
        Apples 3x £0.80
      `

      const result = await monzoService.parseReceipt(receiptText)
      
      expect(result.items).toHaveLength(3)
      expect(result.items[0]).toEqual({
        name: 'Bread',
        quantity: 2,
        price: 2.50
      })
      expect(result.totalAmount).toBe(4.50)
      expect(result.potentialWaste).toBeGreaterThan(0)
    })

    it('should estimate potential waste', async () => {
      const receiptText = 'Bread 1x £2.00'
      const result = await monzoService.parseReceipt(receiptText)
      
      // Bread has 30% waste rate, £2 ≈ 200g, so waste ≈ 60g
      expect(result.potentialWaste).toBeCloseTo(60, 0)
    })
  })

  describe('getMockFoodTransactions', () => {
    it('should return mock data for development', () => {
      const mockTransactions = monzoService.getMockFoodTransactions()
      
      expect(mockTransactions).toHaveLength(3)
      expect(mockTransactions[0].description).toContain('TESCO')
      expect(mockTransactions[1].description).toContain('DELIVEROO')
      expect(mockTransactions[2].description).toContain('BAKERY')
    })
  })
})