'use client'

/**
 * Main Dashboard Component
 * Displays user stats, recent activity, and voice controls
 */

import React, { useState, useEffect } from 'react'
import { Leaf, Coins, TrendingUp, Calendar } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { UserStats, WasteEntry } from '@/types'

interface DashboardProps {
  userAddress: string | null
  stats: UserStats
  recentEntries: WasteEntry[]
}

export const Dashboard: React.FC<DashboardProps> = ({
  userAddress,
  stats,
  recentEntries
}) => {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    generateChartData()
  }, [recentEntries])

  /**
   * Generate chart data from recent entries
   */
  const generateChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toISOString().split('T')[0],
        waste: 0,
        tokens: 0
      }
    })

    recentEntries.forEach(entry => {
      const entryDate = entry.timestamp.toISOString().split('T')[0]
      const dayData = last7Days.find(day => day.date === entryDate)
      if (dayData) {
        dayData.waste += entry.amount
        dayData.tokens += entry.tokensEarned
      }
    })

    setChartData(last7Days.map(day => ({
      ...day,
      date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })
    })))
  }

  /**
   * Format large numbers for display
   */
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  if (!userAddress) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <Leaf className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to HeySalad Tasha! 🥗
        </h2>
        <p className="text-gray-600 mb-6">
          Connect your wallet to start tracking your food waste reduction journey
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Track Waste</h3>
            <p className="text-sm text-green-700">
              Log your food waste reduction activities and earn tokens
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Voice Control</h3>
            <p className="text-sm text-blue-700">
              Use voice commands: "Hey Tasha, log my food waste"
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Impact</h3>
            <p className="text-sm text-purple-700">
              See your environmental impact and CO2 savings
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Waste Reduced</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(stats.totalWasteReduced)}g
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Coins className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tokens Earned</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(stats.totalTokensEarned)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">CO2 Prevented</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.co2Prevented.toFixed(1)}kg
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.currentStreak} days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Weekly Progress
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="waste"
                stroke="#10b981"
                strokeWidth={2}
                name="Waste Reduced (g)"
              />
              <Line
                type="monotone"
                dataKey="tokens"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Tokens Earned"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        {recentEntries.length === 0 ? (
          <div className="text-center py-8">
            <Leaf className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No waste reduction activities yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Start logging your food waste reduction to see your impact!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    entry.actionType === 'donation' ? 'bg-green-100' :
                    entry.actionType === 'composting' ? 'bg-brown-100' :
                    entry.actionType === 'used-before-expiry' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    <Leaf className={`h-4 w-4 ${
                      entry.actionType === 'donation' ? 'text-green-600' :
                      entry.actionType === 'composting' ? 'text-brown-600' :
                      entry.actionType === 'used-before-expiry' ? 'text-blue-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {entry.amount}g - {entry.actionType.replace('-', ' ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {entry.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    +{entry.tokensEarned} FWT
                  </p>
                  {entry.verified && (
                    <p className="text-xs text-green-500">✓ Verified</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}