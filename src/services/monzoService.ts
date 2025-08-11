/**
 * Monzo Integration Service
 * Handles transaction fetching and food purchase categorization
 */

import { MonzoTransaction } from '@/types'

export class MonzoService {
  private accessToken: string | null = null
  private readonly baseUrl = 'https://api.monzo.com'

  /**
   * Initialize Monzo service with access token
   */
  constructor(accessToken?: string) {
    this.accessToken = accessToken || process.env.NEXT_PUBLIC_MONZO_ACCESS_TOKEN || null
  }

  /**
   * Set access token for API calls
   */
  setAccessToken(token: string): void {
    this.accessToken = token
  }

  /**
   * Fetch recent transactions from Monzo API
   */
  async fetchTransactions(accountId: string, limit: number = 100): Promise<MonzoTransaction[]> {
    if (!this.accessToken) {
      throw new Error('Monzo access token not provided')
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/transactions?account_id=${accountId}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Monzo API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.transactions || []
    } catch (error) {
      console.error('Error fetching Monzo transactions:', error)
      throw error
    }
  }

  /**
   * Get food-related transactions from recent transactions
   */
  async getFoodTransactions(accountId: string): Promise<MonzoTransaction[]> {
    const transactions = await this.fetchTransactions(accountId)
    
    return transactions.filter(transaction => 
      this.isFoodRelated(transaction)
    )
  }

  /**
   * Determine if a transaction is food-related
   */
  private isFoodRelated(transaction: MonzoTransaction): boolean {
    const foodCategories = [
      'groceries',
      'eating_out',
      'restaurants',
      'food',
      'supermarket'
    ]

    const foodKeywords = [
      'tesco', 'sainsbury', 'asda', 'morrisons', 'waitrose',
      'restaurant', 'cafe', 'pizza', 'mcdonald', 'kfc',
      'deliveroo', 'uber eats', 'just eat', 'food',
      'grocery', 'supermarket', 'bakery', 'butcher'
    ]

    // Check category
    if (transaction.category && foodCategories.includes(transaction.category.toLowerCase())) {
      return true
    }

    // Check merchant category
    if (transaction.merchant?.category && 
        foodCategories.includes(transaction.merchant.category.toLowerCase())) {
      return true
    }

    // Check description for food keywords
    const description = transaction.description.toLowerCase()
    const merchantName = transaction.merchant?.name?.toLowerCase() || ''
    
    return foodKeywords.some(keyword => 
      description.includes(keyword) || merchantName.includes(keyword)
    )
  }

  /**
   * Parse receipt data to extract food items and potential waste
   */
  async parseReceipt(receiptText: string): Promise<{
    items: Array<{ name: string; quantity: number; price: number }>
    totalAmount: number
    potentialWaste: number
  }> {
    // Simple receipt parsing logic
    // In production, this would use more sophisticated OCR/NLP
    const lines = receiptText.split('\n')
    const items: Array<{ name: string; quantity: number; price: number }> = []
    let totalAmount = 0

    for (const line of lines) {
      // Look for patterns like "Item Name 2x £3.50"
      const itemMatch = line.match(/(.+?)\s+(\d+)x?\s+£?(\d+\.?\d*)/)
      if (itemMatch) {
        const [, name, quantity, price] = itemMatch
        const item = {
          name: name.trim(),
          quantity: parseInt(quantity),
          price: parseFloat(price)
        }
        items.push(item)
        totalAmount += item.price
      }
    }

    // Estimate potential waste (simplified logic)
    const potentialWaste = this.estimatePotentialWaste(items)

    return {
      items,
      totalAmount,
      potentialWaste
    }
  }

  /**
   * Estimate potential food waste based on purchase patterns
   */
  private estimatePotentialWaste(items: Array<{ name: string; quantity: number; price: number }>): number {
    // Simplified waste estimation based on food type
    const wasteRates = {
      'bread': 0.3,
      'milk': 0.2,
      'fruit': 0.4,
      'vegetable': 0.35,
      'meat': 0.15,
      'dairy': 0.25,
      'default': 0.2
    }

    let totalWaste = 0
    
    for (const item of items) {
      const itemName = item.name.toLowerCase()
      let wasteRate = wasteRates.default
      
      // Match item to waste category
      for (const [category, rate] of Object.entries(wasteRates)) {
        if (itemName.includes(category)) {
          wasteRate = rate
          break
        }
      }
      
      // Estimate waste in grams (simplified conversion)
      const estimatedWeight = item.price * 100 // £1 ≈ 100g (very rough)
      totalWaste += estimatedWeight * wasteRate
    }

    return Math.round(totalWaste)
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Monzo access token not provided')
    }

    try {
      const response = await fetch(`${this.baseUrl}/accounts`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Monzo API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching Monzo account info:', error)
      throw error
    }
  }

  /**
   * Mock data for development/testing
   */
  getMockFoodTransactions(): MonzoTransaction[] {
    return [
      {
        id: 'tx_001',
        amount: -2350, // £23.50
        currency: 'GBP',
        description: 'TESCO STORES 3297',
        merchant: {
          name: 'Tesco',
          category: 'groceries'
        },
        created: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        category: 'groceries'
      },
      {
        id: 'tx_002',
        amount: -1250, // £12.50
        currency: 'GBP',
        description: 'DELIVEROO',
        merchant: {
          name: 'Deliveroo',
          category: 'eating_out'
        },
        created: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        category: 'eating_out'
      },
      {
        id: 'tx_003',
        amount: -850, // £8.50
        currency: 'GBP',
        description: 'LOCAL BAKERY',
        merchant: {
          name: 'Corner Bakery',
          category: 'food'
        },
        created: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        category: 'food'
      }
    ]
  }
}