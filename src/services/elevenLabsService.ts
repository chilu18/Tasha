/**
 * ElevenLabs Voice AI Service
 * Handles text-to-speech and voice response generation
 */

import { VoiceResponse } from '@/types'

export class ElevenLabsService {
  private apiKey: string | null = null
  private readonly baseUrl = 'https://api.elevenlabs.io/v1'
  private readonly voiceId = 'pNInz6obpgDQGcFmaJgB' // Default voice ID

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || null
  }

  /**
   * Convert text to speech using ElevenLabs API
   */
  async textToSpeech(text: string, voiceId?: string): Promise<string> {
    if (!this.apiKey) {
      console.warn('ElevenLabs API key not provided, returning mock audio URL')
      return 'data:audio/wav;base64,mock-audio-data'
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${voiceId || this.voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5
            }
          })
        }
      )

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`)
      }

      const audioBlob = await response.blob()
      return URL.createObjectURL(audioBlob)
    } catch (error) {
      console.error('Error generating speech:', error)
      throw error
    }
  }

  /**
   * Generate contextual voice responses for different actions
   */
  async generateResponse(action: string, data?: any): Promise<VoiceResponse> {
    let responseText = ''

    switch (action) {
      case 'waste_logged':
        responseText = `Great job! I've logged ${data.amount} grams of food waste reduction. You've earned ${data.tokens} tokens and prevented ${data.co2} kg of CO2 emissions.`
        break
      
      case 'balance_check':
        responseText = `Your current balance is ${data.balance} Food Waste Tokens. You've reduced ${data.totalWaste} grams of food waste so far.`
        break
      
      case 'stats_summary':
        responseText = `Here are your stats: You've reduced ${data.totalWaste} grams of food waste, earned ${data.totalTokens} tokens, and prevented ${data.co2Prevented} kg of CO2 emissions. Keep up the great work!`
        break
      
      case 'welcome':
        responseText = "Hi! I'm Tasha, your food waste reduction assistant. You can say things like 'log my food waste' or 'check my balance'. How can I help you today?"
        break
      
      case 'error':
        responseText = `Sorry, I encountered an error: ${data.message}. Please try again or contact support if the problem persists.`
        break
      
      case 'help':
        responseText = "I can help you log food waste, check your token balance, view your stats, and track your environmental impact. Just speak naturally - for example, say 'I saved 200 grams of food today' or 'what's my balance?'"
        break
      
      default:
        responseText = "I'm not sure how to help with that. Try saying 'help' to see what I can do."
    }

    try {
      const audioUrl = await this.textToSpeech(responseText)
      return { text: responseText, audioUrl }
    } catch (error) {
      console.error('Error generating voice response:', error)
      return { text: responseText }
    }
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getVoices(): Promise<any[]> {
    if (!this.apiKey) {
      return []
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`)
      }

      const data = await response.json()
      return data.voices || []
    } catch (error) {
      console.error('Error fetching voices:', error)
      return []
    }
  }
}