'use client'

/**
 * Transaction History Component
 * Displays user's waste reduction transaction history
 */

import React, { useState } from 'react'
import { History, Filter, ExternalLink, CheckCircle, Clock } from 'lucide-react'
import { WasteEntry } from '@/types'

interface TransactionHistoryProps {
  entries: WasteEntry[]
  isLoading?: boolean
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  entries,
  isLoading = false
}) => {
  const [filter, setFilter] = useState<'all' | WasteEntry['actionType']>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'tokens'>('date')

  /**
   * Filter and sort entries
   */
  const filteredEntries = entries
    .filter(entry => filter === 'all' || entry.actionType === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.timestamp.getTime() - a.timestamp.getTime()
        case 'amount':
          return b.amount - a.amount
        case 'tokens':
          return b.tokensEarned - a.tokensEarned
        default:
          return 0
      }
    })

  /**
   * Get action type color
   */
  const getActionTypeColor = (actionType: WasteEntry['actionType']) => {
    switch (actionType) {
      case 'donation': return 'text-green-600 bg-green-100'
      case 'composting': return 'text-yellow-600 bg-yellow-100'
      case 'used-before-expiry': return 'text-blue-600 bg-blue-100'
      case 'efficient-delivery': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  /**
   * Format action type for display
   */
  const formatActionType = (actionType: WasteEntry['actionType']) => {
    return actionType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  /**
   * Format transaction hash for display
   */
  const formatTxHash = (hash?: string) => {
    if (!hash) return 'Pending'
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <History className="h-6 w-6 text-gray-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">
            Transaction History
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {filteredEntries.length} transactions
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Type
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="donation">Donation</option>
            <option value="composting">Composting</option>
            <option value="used-before-expiry">Used Before Expiry</option>
            <option value="efficient-delivery">Efficient Delivery</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="tokens">Tokens</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-12">
          <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No transactions found
          </h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? "Start logging your food waste reduction activities to see them here"
              : `No ${formatActionType(filter as WasteEntry['actionType']).toLowerCase()} activities found`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getActionTypeColor(entry.actionType)}`}>
                    {formatActionType(entry.actionType)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {entry.amount}g reduced
                    </p>
                    <p className="text-sm text-gray-600">
                      {entry.timestamp.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    +{entry.tokensEarned} FWT
                  </p>
                  <div className="flex items-center mt-1">
                    {entry.verified ? (
                      <div className="flex items-center text-green-500">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-yellow-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-xs">Pending</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {entry.description && (
                <p className="text-sm text-gray-600 mt-2">
                  {entry.description}
                </p>
              )}

              {entry.transactionHash && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Transaction Hash:</span>
                  <button
                    onClick={() => {
                      // In production, this would link to a block explorer
                      navigator.clipboard.writeText(entry.transactionHash!)
                    }}
                    className="flex items-center text-xs text-blue-600 hover:text-blue-700"
                  >
                    {formatTxHash(entry.transactionHash)}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredEntries.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredEntries.reduce((sum, entry) => sum + entry.amount, 0)}g
              </p>
              <p className="text-sm text-gray-600">Total Waste Reduced</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {filteredEntries.reduce((sum, entry) => sum + entry.tokensEarned, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Tokens Earned</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {((filteredEntries.reduce((sum, entry) => sum + entry.amount, 0) / 1000) * 2.5).toFixed(1)}kg
              </p>
              <p className="text-sm text-gray-600">CO2 Prevented</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}