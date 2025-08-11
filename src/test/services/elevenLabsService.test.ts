/**
 * Tests for ElevenLabsService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ElevenLabsService } from '@/services/elevenLabsService'

// Mock fetch and URL.createObjectURL
global.fetch = vi.fn()
global.URL.createObjectURL = vi.fn(() => 'mock-audio-url')

describe('ElevenLabsService', () => {
  let elevenLabsService: ElevenLabsService

  beforeEach(() => {
    elevenLabsService = new ElevenLabsService()
    vi.clearAllMocks()
  })

  describe('textToSpeech', () => {
    it('should convert text to speech successfully', async () => {
      const mockBlob = new Blob(['mock audio data'], { type: 'audio/mpeg' })
      
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob
      })

      // Mock API key
      process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY = 'test-api-key'
      
      const result = await elevenLabsService.textToSpeech('Hello world')
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'xi-api-key': 'test-api-key'
          }),
          body: expect.stringContaining('Hello world')
        })
      )
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob)
      expect(result).toBe('mock-audio-url')
    })

    it('should return mock audio URL when API key is missing', async () => {
      delete process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
      
      const result = await elevenLabsService.textToSpeech('Hello world')
      
      expect(result).toBe('data:audio/wav;base64,mock-audio-data')
      expect(fetch).not.toHaveBeenCalled()
    })

    it('should throw error on API failure', async () => {
      process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY = 'test-api-key'
      
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      await expect(elevenLabsService.textToSpeech('Hello world'))
        .rejects.toThrow('ElevenLabs API error: 401')
    })
  })

  describe('generateResponse', () => {
    it('should generate waste_logged response', async () => {
      const mockData = { amount: 250, tokens: 25, co2: 0.625 }
      
      vi.spyOn(elevenLabsService, 'textToSpeech').mockResolvedValue('mock-audio-url')
      
      const result = await elevenLabsService.generateResponse('waste_logged', mockData)
      
      expect(result.text).toContain('250 grams')
      expect(result.text).toContain('25 tokens')
      expect(result.text).toContain('0.625 kg')
      expect(result.audioUrl).toBe('mock-audio-url')
    })

    it('should generate balance_check response', async () => {
      const mockData = { balance: 150, totalWaste: 1500 }
      
      vi.spyOn(elevenLabsService, 'textToSpeech').mockResolvedValue('mock-audio-url')
      
      const result = await elevenLabsService.generateResponse('balance_check', mockData)
      
      expect(result.text).toContain('150 Food Waste Tokens')
      expect(result.text).toContain('1500 grams')
      expect(result.audioUrl).toBe('mock-audio-url')
    })

    it('should generate welcome response', async () => {
      vi.spyOn(elevenLabsService, 'textToSpeech').mockResolvedValue('mock-audio-url')
      
      const result = await elevenLabsService.generateResponse('welcome')
      
      expect(result.text).toContain("I'm Tasha")
      expect(result.text).toContain('food waste reduction assistant')
      expect(result.audioUrl).toBe('mock-audio-url')
    })

    it('should handle unknown actions', async () => {
      vi.spyOn(elevenLabsService, 'textToSpeech').mockResolvedValue('mock-audio-url')
      
      const result = await elevenLabsService.generateResponse('unknown_action')
      
      expect(result.text).toContain("I'm not sure how to help")
      expect(result.audioUrl).toBe('mock-audio-url')
    })

    it('should return text-only response on audio generation failure', async () => {
      vi.spyOn(elevenLabsService, 'textToSpeech').mockRejectedValue(new Error('Audio failed'))
      
      const result = await elevenLabsService.generateResponse('welcome')
      
      expect(result.text).toContain("I'm Tasha")
      expect(result.audioUrl).toBeUndefined()
    })
  })

  describe('getVoices', () => {
    it('should fetch available voices', async () => {
      const mockVoices = [
        { voice_id: 'voice1', name: 'Voice 1' },
        { voice_id: 'voice2', name: 'Voice 2' }
      ]
      
      process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY = 'test-api-key'
      
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ voices: mockVoices })
      })

      const result = await elevenLabsService.getVoices()
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.elevenlabs.io/v1/voices',
        expect.objectContaining({
          headers: { 'xi-api-key': 'test-api-key' }
        })
      )
      expect(result).toEqual(mockVoices)
    })

    it('should return empty array when API key is missing', async () => {
      delete process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
      
      const result = await elevenLabsService.getVoices()
      
      expect(result).toEqual([])
      expect(fetch).not.toHaveBeenCalled()
    })
  })
})