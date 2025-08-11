'use client'

/**
 * Main Application Page
 * HeySalad Tasha - Food Waste Reduction dApp
 */

import React, { useState, useEffect } from 'react'
import { Leaf, Menu, X } from 'lucide-react'
import { WalletConnection } from '@/components/WalletConnection'
import { VoiceInterface } from '@/components/VoiceInterface'
import { Dashboard } from '@/components/Dashboard'
import { WasteLogger } from '@/components/WasteLogger'
import { TransactionHistory } from '@/components/TransactionHistory'
import { PolkadotService } from '@/services/polkadotService'
import { MonzoService } from '@/services/monzoService'
import { ElevenLabsService } from '@/services/elevenLabsService'
import { WalletAccount, UserStats, WasteEntry, VoiceCommand } from '@/types'

export default function Home() {
  // State management
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'log' | 'history' | 'voice'>('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // User data
  const [userStats, setUserStats] = useState<UserStats>({
    totalWasteReduced: 0,
    totalTokensEarned: 0,
    co2Prevented: 0,
    transactionCount: 0,
    currentStreak: 0
  })
  const [wasteEntries, setWasteEntries] = useState<WasteEntry[]>([])
  
  // Services
  const [polkadotService] = useState(() => new PolkadotService())
  const [monzoService] = useState(() => new MonzoService())
  const [elevenLabsService] = useState(() => new ElevenLabsService())

  useEffect(() => {
    initializeApp()
  }, [])

  useEffect(() => {
    if (selectedAccount) {
      loadUserData()
    }
  }, [selectedAccount])

  /**
   * Initialize the application
   */
  const initializeApp = async () => {
    try {
      await polkadotService.initialize()
    } catch (error) {
      console.error('Failed to initialize app:', error)
    }
  }

  /**
   * Load user data from blockchain and services
   */
  const loadUserData = async () => {
    if (!selectedAccount) return

    setIsLoading(true)
    try {
      // Load waste history (mock data for now)
      const history = await polkadotService.getWasteHistory(selectedAccount.address)
      const entries: WasteEntry[] = history.map(item => ({
        id: item.id,
        userId: selectedAccount.address,
        amount: item.amount,
        actionType: item.actionType,
        description: `${item.actionType} - ${item.amount}g`,
        timestamp: item.timestamp,
        tokensEarned: item.tokensEarned,
        verified: true,
        transactionHash: item.txHash
      }))

      setWasteEntries(entries)

      // Calculate stats
      const stats: UserStats = {
        totalWasteReduced: entries.reduce((sum, entry) => sum + entry.amount, 0),
        totalTokensEarned: entries.reduce((sum, entry) => sum + entry.tokensEarned, 0),
        co2Prevented: entries.reduce((sum, entry) => sum + polkadotService.calculateCO2Prevented(entry.amount), 0),
        transactionCount: entries.length,
        currentStreak: calculateStreak(entries)
      }

      setUserStats(stats)
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Calculate current streak of consecutive days with waste reduction
   */
  const calculateStreak = (entries: WasteEntry[]): number => {
    if (entries.length === 0) return 0

    const sortedEntries = entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    const today = new Date()
    let streak = 0
    let currentDate = new Date(today)

    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dayEntries = sortedEntries.filter(entry => {
        const entryDate = new Date(entry.timestamp)
        return entryDate.toDateString() === currentDate.toDateString()
      })

      if (dayEntries.length > 0) {
        streak++
      } else if (streak > 0) {
        break // Streak broken
      }

      currentDate.setDate(currentDate.getDate() - 1)
    }

    return streak
  }

  /**
   * Handle waste logging
   */
  const handleLogWaste = async (entry: Omit<WasteEntry, 'id' | 'userId' | 'timestamp' | 'tokensEarned' | 'verified'>) => {
    if (!selectedAccount) {
      throw new Error('No wallet connected')
    }

    setIsLoading(true)
    try {
      // Calculate tokens
      const tokensEarned = polkadotService.calculateTokens(entry.amount)
      
      // Log to blockchain (mock for now)
      const txHash = await polkadotService.logWasteReduction(
        selectedAccount.address,
        entry.amount,
        entry.actionType
      )

      // Create new entry
      const newEntry: WasteEntry = {
        id: Date.now().toString(),
        userId: selectedAccount.address,
        timestamp: new Date(),
        tokensEarned,
        verified: true,
        transactionHash: txHash,
        ...entry
      }

      // Update state
      setWasteEntries(prev => [newEntry, ...prev])
      setUserStats(prev => ({
        totalWasteReduced: prev.totalWasteReduced + entry.amount,
        totalTokensEarned: prev.totalTokensEarned + tokensEarned,
        co2Prevented: prev.co2Prevented + polkadotService.calculateCO2Prevented(entry.amount),
        transactionCount: prev.transactionCount + 1,
        currentStreak: calculateStreak([newEntry, ...wasteEntries])
      }))

      // Generate voice response
      try {
        const response = await elevenLabsService.generateResponse('waste_logged', {
          amount: entry.amount,
          tokens: tokensEarned,
          co2: polkadotService.calculateCO2Prevented(entry.amount).toFixed(2)
        })
        console.log('Voice response generated:', response.text)
      } catch (error) {
        console.error('Failed to generate voice response:', error)
      }

    } catch (error) {
      console.error('Failed to log waste:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle voice commands
   */
  const handleVoiceCommand = async (command: VoiceCommand) => {
    try {
      switch (command.action) {
        case 'log_waste':
          if (command.parameters?.amount) {
            await handleLogWaste({
              amount: command.parameters.amount,
              actionType: (command.parameters.actionType as any) || 'other',
              description: command.parameters.description || `Voice logged: ${command.parameters.amount}g`
            })
          } else {
            setActiveTab('log')
          }
          break

        case 'check_balance':
          const response = await elevenLabsService.generateResponse('balance_check', {
            balance: userStats.totalTokensEarned,
            totalWaste: userStats.totalWasteReduced
          })
          console.log('Balance response:', response.text)
          break

        case 'view_stats':
          const statsResponse = await elevenLabsService.generateResponse('stats_summary', {
            totalWaste: userStats.totalWasteReduced,
            totalTokens: userStats.totalTokensEarned,
            co2Prevented: userStats.co2Prevented.toFixed(1)
          })
          console.log('Stats response:', statsResponse.text)
          setActiveTab('dashboard')
          break

        case 'help':
          const helpResponse = await elevenLabsService.generateResponse('help')
          console.log('Help response:', helpResponse.text)
          break
      }
    } catch (error) {
      console.error('Error handling voice command:', error)
      const errorResponse = await elevenLabsService.generateResponse('error', {
        message: error instanceof Error ? error.message : 'Unknown error'
      })
      console.log('Error response:', errorResponse.text)
    }
  }

  /**
   * Navigation items
   */
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'log', label: 'Log Waste', icon: '➕' },
    { id: 'history', label: 'History', icon: '📋' },
    { id: 'voice', label: 'Voice Assistant', icon: '🎤' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center ml-2 md:ml-0">
                <Leaf className="h-8 w-8 text-green-600" />
                <div className="ml-2">
                  <h1 className="text-xl font-bold text-gray-900">HeySalad Tasha</h1>
                  <p className="text-xs text-gray-600">Food Waste Reduction dApp</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {selectedAccount && (
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {userStats.totalTokensEarned} FWT
                  </p>
                  <p className="text-xs text-gray-600">
                    {userStats.totalWasteReduced}g reduced
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className={`lg:w-80 ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-6">
              {/* Wallet Connection */}
              <WalletConnection onAccountChange={setSelectedAccount} />
              
              {/* Navigation */}
              {selectedAccount && (
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <nav className="space-y-2">
                    {navItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as any)
                          setIsSidebarOpen(false)
                        }}
                        className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                          activeTab === item.id
                            ? 'bg-green-100 text-green-800 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {!selectedAccount ? (
              <Dashboard
                userAddress={null}
                stats={userStats}
                recentEntries={wasteEntries}
              />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <Dashboard
                    userAddress={selectedAccount.address}
                    stats={userStats}
                    recentEntries={wasteEntries}
                  />
                )}
                
                {activeTab === 'log' && (
                  <WasteLogger
                    onLogWaste={handleLogWaste}
                    isLoading={isLoading}
                  />
                )}
                
                {activeTab === 'history' && (
                  <TransactionHistory
                    entries={wasteEntries}
                    isLoading={isLoading}
                  />
                )}
                
                {activeTab === 'voice' && (
                  <VoiceInterface
                    onCommand={handleVoiceCommand}
                    isProcessing={isLoading}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}