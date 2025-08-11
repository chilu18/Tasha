'use client'

/**
 * Waste Logger Component
 * Form for logging food waste reduction activities
 */

import React, { useState } from 'react'
import { Plus, Loader2, CheckCircle } from 'lucide-react'
import { WasteEntry } from '@/types'

interface WasteLoggerProps {
  onLogWaste: (entry: Omit<WasteEntry, 'id' | 'userId' | 'timestamp' | 'tokensEarned' | 'verified'>) => Promise<void>
  isLoading?: boolean
}

export const WasteLogger: React.FC<WasteLoggerProps> = ({
  onLogWaste,
  isLoading = false
}) => {
  const [amount, setAmount] = useState('')
  const [actionType, setActionType] = useState<WasteEntry['actionType']>('other')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setIsSubmitting(true)
    
    try {
      await onLogWaste({
        amount: parseFloat(amount),
        actionType,
        description: description || `${actionType.replace('-', ' ')} - ${amount}g`
      })
      
      // Reset form
      setAmount('')
      setDescription('')
      setActionType('other')
      
      // Show success message
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error logging waste:', error)
      alert('Failed to log waste reduction. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Get action type display name
   */
  const getActionTypeLabel = (type: WasteEntry['actionType']) => {
    switch (type) {
      case 'donation': return 'Food Donation'
      case 'efficient-delivery': return 'Efficient Delivery'
      case 'used-before-expiry': return 'Used Before Expiry'
      case 'composting': return 'Composting'
      case 'other': return 'Other'
      default: return 'Other'
    }
  }

  /**
   * Calculate estimated tokens
   */
  const calculateEstimatedTokens = () => {
    if (!amount) return 0
    return Math.floor((parseFloat(amount) / 1000) * 10) // 10 tokens per kg
  }

  /**
   * Calculate estimated CO2 savings
   */
  const calculateCO2Savings = () => {
    if (!amount) return 0
    return ((parseFloat(amount) / 1000) * 2.5).toFixed(2) // 2.5kg CO2 per kg food
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Plus className="h-6 w-6 text-green-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-900">
          Log Food Waste Reduction
        </h2>
      </div>

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800 font-medium">
              Waste reduction logged successfully!
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount (grams)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 250"
            min="1"
            step="1"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Action Type Selection */}
        <div>
          <label htmlFor="actionType" className="block text-sm font-medium text-gray-700 mb-2">
            Action Type
          </label>
          <select
            id="actionType"
            value={actionType}
            onChange={(e) => setActionType(e.target.value as WasteEntry['actionType'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="donation">Food Donation</option>
            <option value="efficient-delivery">Efficient Delivery</option>
            <option value="used-before-expiry">Used Before Expiry</option>
            <option value="composting">Composting</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your waste reduction activity..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Impact Preview */}
        {amount && parseFloat(amount) > 0 && (
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">Estimated Impact</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-green-700">Tokens to earn:</p>
                <p className="font-semibold text-green-800">
                  {calculateEstimatedTokens()} FWT
                </p>
              </div>
              <div>
                <p className="text-green-700">CO2 prevented:</p>
                <p className="font-semibold text-green-800">
                  {calculateCO2Savings()} kg
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoading || !amount}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isSubmitting || isLoading || !amount
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Logging Waste Reduction...
            </div>
          ) : (
            'Log Waste Reduction'
          )}
        </button>
      </form>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { amount: '100', type: 'used-before-expiry', label: '100g - Used before expiry' },
            { amount: '250', type: 'donation', label: '250g - Donated food' },
            { amount: '500', type: 'composting', label: '500g - Composted' },
            { amount: '1000', type: 'efficient-delivery', label: '1kg - Efficient delivery' }
          ].map((quick, index) => (
            <button
              key={index}
              onClick={() => {
                setAmount(quick.amount)
                setActionType(quick.type as WasteEntry['actionType'])
              }}
              className="text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
            >
              {quick.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}