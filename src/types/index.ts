/**
 * Core type definitions for HeySalad Tasha application
 */

export interface WasteEntry {
  id: string
  userId: string
  amount: number // in grams
  actionType: 'donation' | 'efficient-delivery' | 'used-before-expiry' | 'composting' | 'other'
  description: string
  timestamp: Date
  tokensEarned: number
  verified: boolean
  transactionHash?: string
}

export interface UserStats {
  totalWasteReduced: number // in grams
  totalTokensEarned: number
  co2Prevented: number // in kg
  transactionCount: number
  currentStreak: number
}

export interface MonzoTransaction {
  id: string
  amount: number
  currency: string
  description: string
  merchant?: {
    name: string
    category: string
  }
  created: string
  category: string
}

export interface VoiceCommand {
  action: 'log_waste' | 'check_balance' | 'view_stats' | 'help'
  parameters?: {
    amount?: number
    actionType?: string
    description?: string
  }
}

export interface WalletAccount {
  address: string
  meta: {
    name?: string
    source: string
  }
}

export interface ContractInteraction {
  method: string
  args: any[]
  gasLimit?: number
}

export interface AIVerificationResult {
  verified: boolean
  confidence: number
  reasoning: string
  suggestedAmount?: number
}

export interface VoiceResponse {
  text: string
  audioUrl?: string
}