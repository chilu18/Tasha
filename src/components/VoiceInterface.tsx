'use client'

/**
 * Voice Interface Component
 * Handles speech recognition and voice responses using ElevenLabs
 */

import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { ElevenLabsService } from '@/services/elevenLabsService'
import { VoiceCommand, VoiceResponse } from '@/types'

interface VoiceInterfaceProps {
  onCommand: (command: VoiceCommand) => void
  isProcessing?: boolean
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onCommand,
  isProcessing = false
}) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [lastResponse, setLastResponse] = useState<VoiceResponse | null>(null)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const elevenLabsService = useRef(new ElevenLabsService())

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onstart = () => {
          setIsListening(true)
          setTranscript('')
        }

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = ''
          let interimTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          setTranscript(finalTranscript || interimTranscript)

          if (finalTranscript) {
            processVoiceCommand(finalTranscript)
          }
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  /**
   * Process voice command and extract intent
   */
  const processVoiceCommand = (text: string) => {
    const lowerText = text.toLowerCase()
    
    // Log waste patterns
    if (lowerText.includes('log') || lowerText.includes('save') || lowerText.includes('reduce')) {
      const amountMatch = lowerText.match(/(\d+)\s*(gram|grams|g|kg|kilogram|kilograms)/)
      const amount = amountMatch ? parseInt(amountMatch[1]) * (amountMatch[2].startsWith('k') ? 1000 : 1) : null
      
      let actionType = 'other'
      if (lowerText.includes('donat')) actionType = 'donation'
      else if (lowerText.includes('compost')) actionType = 'composting'
      else if (lowerText.includes('expir') || lowerText.includes('before')) actionType = 'used-before-expiry'
      else if (lowerText.includes('deliver')) actionType = 'efficient-delivery'

      onCommand({
        action: 'log_waste',
        parameters: {
          amount,
          actionType,
          description: text
        }
      })
    }
    // Balance check patterns
    else if (lowerText.includes('balance') || lowerText.includes('token')) {
      onCommand({ action: 'check_balance' })
    }
    // Stats patterns
    else if (lowerText.includes('stat') || lowerText.includes('progress') || lowerText.includes('impact')) {
      onCommand({ action: 'view_stats' })
    }
    // Help patterns
    else if (lowerText.includes('help') || lowerText.includes('what can you do')) {
      onCommand({ action: 'help' })
    }
    else {
      // Default to help if command not recognized
      onCommand({ action: 'help' })
    }
  }

  /**
   * Start listening for voice commands
   */
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start()
    }
  }

  /**
   * Stop listening
   */
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  /**
   * Play voice response
   */
  const playResponse = async (response: VoiceResponse) => {
    if (response.audioUrl && !isPlaying) {
      setIsPlaying(true)
      
      if (audioRef.current) {
        audioRef.current.pause()
      }
      
      audioRef.current = new Audio(response.audioUrl)
      audioRef.current.onended = () => setIsPlaying(false)
      audioRef.current.onerror = () => setIsPlaying(false)
      
      try {
        await audioRef.current.play()
      } catch (error) {
        console.error('Error playing audio:', error)
        setIsPlaying(false)
      }
    }
  }

  /**
   * Stop audio playback
   */
  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  /**
   * Generate and play welcome message
   */
  const playWelcome = async () => {
    try {
      const response = await elevenLabsService.current.generateResponse('welcome')
      setLastResponse(response)
      await playResponse(response)
    } catch (error) {
      console.error('Error playing welcome message:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Hey Tasha! 🥗
        </h3>
        <p className="text-gray-600 text-sm">
          Your AI voice assistant for food waste tracking
        </p>
      </div>

      {/* Voice Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`p-4 rounded-full transition-all duration-200 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button
          onClick={isPlaying ? stopPlayback : playWelcome}
          className={`p-4 rounded-full transition-all duration-200 ${
            isPlaying
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isPlaying ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>

      {/* Status Display */}
      <div className="text-center mb-4">
        {isListening && (
          <div className="text-blue-600 font-medium">
            🎤 Listening...
          </div>
        )}
        {isProcessing && (
          <div className="text-orange-600 font-medium">
            🤖 Processing...
          </div>
        )}
        {isPlaying && (
          <div className="text-green-600 font-medium">
            🔊 Speaking...
          </div>
        )}
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-700">
            <strong>You said:</strong> "{transcript}"
          </p>
        </div>
      )}

      {/* Last Response */}
      {lastResponse && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Tasha:</strong> {lastResponse.text}
          </p>
        </div>
      )}

      {/* Usage Examples */}
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Try saying:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>"Log 200 grams of food waste"</li>
          <li>"I donated food today"</li>
          <li>"Check my balance"</li>
          <li>"Show my stats"</li>
          <li>"Help"</li>
        </ul>
      </div>
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}