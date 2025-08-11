'use client'

/**
 * Wallet Connection Component
 * Handles Polkadot wallet connection and account management
 */

import React, { useState, useEffect } from 'react'
import { Wallet, LogOut, Copy, Check } from 'lucide-react'
import { PolkadotService } from '@/services/polkadotService'
import { WalletAccount } from '@/types'

interface WalletConnectionProps {
  onAccountChange: (account: WalletAccount | null) => void
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({
  onAccountChange
}) => {
  const [accounts, setAccounts] = useState<WalletAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [balance, setBalance] = useState<string>('0')
  const [copied, setCopied] = useState(false)
  
  const polkadotService = new PolkadotService()

  useEffect(() => {
    initializeService()
  }, [])

  useEffect(() => {
    if (selectedAccount) {
      fetchBalance()
    }
  }, [selectedAccount])

  /**
   * Initialize Polkadot service
   */
  const initializeService = async () => {
    try {
      await polkadotService.initialize()
    } catch (error) {
      console.error('Failed to initialize Polkadot service:', error)
    }
  }

  /**
   * Connect to wallet
   */
  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      const walletAccounts = await polkadotService.connectWallet()
      setAccounts(walletAccounts)
      
      if (walletAccounts.length > 0) {
        const firstAccount = walletAccounts[0]
        setSelectedAccount(firstAccount)
        onAccountChange(firstAccount)
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      alert('Failed to connect wallet. Please make sure Polkadot.js extension is installed and you have accounts.')
    } finally {
      setIsConnecting(false)
    }
  }

  /**
   * Disconnect wallet
   */
  const disconnectWallet = () => {
    setAccounts([])
    setSelectedAccount(null)
    setBalance('0')
    onAccountChange(null)
  }

  /**
   * Fetch account balance
   */
  const fetchBalance = async () => {
    if (!selectedAccount) return
    
    try {
      const accountBalance = await polkadotService.getBalance(selectedAccount.address)
      // Convert from planck to DOT (simplified)
      const balanceInDOT = (parseInt(accountBalance) / 1e12).toFixed(4)
      setBalance(balanceInDOT)
    } catch (error) {
      console.error('Failed to fetch balance:', error)
    }
  }

  /**
   * Copy address to clipboard
   */
  const copyAddress = async () => {
    if (!selectedAccount) return
    
    try {
      await navigator.clipboard.writeText(selectedAccount.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  /**
   * Format address for display
   */
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  if (!selectedAccount) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-gray-600 mb-6">
            Connect your Polkadot wallet to start tracking food waste reduction
          </p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors ${
              isConnecting
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-700'
            }`}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>Requires Polkadot.js browser extension</p>
            <a
              href="https://polkadot.js.org/extension/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Install Polkadot.js Extension
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Wallet Connected
        </h3>
        <button
          onClick={disconnectWallet}
          className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
          title="Disconnect Wallet"
        >
          <LogOut size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Account Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Account</span>
            <button
              onClick={copyAddress}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span className="text-sm">
                {copied ? 'Copied!' : 'Copy'}
              </span>
            </button>
          </div>
          <p className="text-sm text-gray-900 font-mono">
            {formatAddress(selectedAccount.address)}
          </p>
          {selectedAccount.meta.name && (
            <p className="text-sm text-gray-600 mt-1">
              {selectedAccount.meta.name}
            </p>
          )}
        </div>

        {/* Balance */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Balance</span>
            <button
              onClick={fetchBalance}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Refresh
            </button>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {balance} DOT
          </p>
        </div>

        {/* Network Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <span className="text-sm font-medium text-gray-700">Network</span>
          <p className="text-sm text-gray-900">
            Asset Hub Westend (Testnet)
          </p>
        </div>
      </div>
    </div>
  )
}