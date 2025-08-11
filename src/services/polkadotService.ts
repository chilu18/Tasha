/**
 * Polkadot Blockchain Service
 * Handles wallet connection and smart contract interactions
 */

import { ApiPromise, WsProvider } from '@polkadot/api'
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp'
import { WalletAccount, ContractInteraction } from '@/types'

export class PolkadotService {
  private api: ApiPromise | null = null
  private readonly wsEndpoint = 'wss://westend-asset-hub-rpc.polkadot.io'
  
  /**
   * Initialize connection to Polkadot network
   */
  async initialize(): Promise<void> {
    try {
      const provider = new WsProvider(this.wsEndpoint)
      this.api = await ApiPromise.create({ provider })
      console.log('Connected to Polkadot Asset Hub Westend')
    } catch (error) {
      console.error('Failed to connect to Polkadot network:', error)
      throw error
    }
  }

  /**
   * Enable wallet extension and get accounts
   */
  async connectWallet(): Promise<WalletAccount[]> {
    try {
      // Enable the extension
      const extensions = await web3Enable('HeySalad Tasha')
      
      if (extensions.length === 0) {
        throw new Error('No wallet extension found. Please install Polkadot.js extension.')
      }

      // Get all accounts
      const accounts = await web3Accounts()
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please create an account in your wallet.')
      }

      return accounts.map(account => ({
        address: account.address,
        meta: account.meta
      }))
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    }
  }

  /**
   * Get account balance
   */
  async getBalance(address: string): Promise<string> {
    if (!this.api) {
      throw new Error('API not initialized')
    }

    try {
      const { data: balance } = await this.api.query.system.account(address)
      return balance.free.toString()
    } catch (error) {
      console.error('Error fetching balance:', error)
      throw error
    }
  }

  /**
   * Log waste reduction on blockchain (mock implementation)
   * In production, this would interact with the deployed smart contract
   */
  async logWasteReduction(
    userAddress: string,
    amount: number,
    actionType: string
  ): Promise<string> {
    if (!this.api) {
      throw new Error('API not initialized')
    }

    try {
      // Mock transaction hash for development
      // In production, this would create and submit an actual transaction
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`
      
      console.log('Logging waste reduction:', {
        userAddress,
        amount,
        actionType,
        txHash: mockTxHash
      })

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      return mockTxHash
    } catch (error) {
      console.error('Error logging waste reduction:', error)
      throw error
    }
  }

  /**
   * Get user's waste reduction history (mock implementation)
   */
  async getWasteHistory(userAddress: string): Promise<any[]> {
    // Mock data for development
    return [
      {
        id: '1',
        amount: 500,
        actionType: 'donation',
        timestamp: new Date(Date.now() - 86400000),
        tokensEarned: 50,
        txHash: '0xabc123...'
      },
      {
        id: '2',
        amount: 300,
        actionType: 'used-before-expiry',
        timestamp: new Date(Date.now() - 172800000),
        tokensEarned: 30,
        txHash: '0xdef456...'
      }
    ]
  }

  /**
   * Calculate tokens earned for waste reduction
   */
  calculateTokens(wasteAmount: number): number {
    // 10 tokens per kg of waste reduced
    return Math.floor((wasteAmount / 1000) * 10)
  }

  /**
   * Calculate CO2 emissions prevented
   */
  calculateCO2Prevented(wasteAmount: number): number {
    // Approximately 2.5 kg CO2 per kg of food waste prevented
    return (wasteAmount / 1000) * 2.5
  }

  /**
   * Disconnect from the network
   */
  async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect()
      this.api = null
    }
  }
}