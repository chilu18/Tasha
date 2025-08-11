import '@testing-library/jest-dom'

// Mock Web APIs
global.MediaRecorder = class MediaRecorder {
  static isTypeSupported = () => true
  ondataavailable = null
  onstart = null
  onstop = null
  onerror = null
  state = 'inactive'
  
  constructor() {}
  start() { this.state = 'recording' }
  stop() { this.state = 'inactive' }
  pause() {}
  resume() {}
  requestData() {}
} as any

global.navigator.mediaDevices = {
  getUserMedia: () => Promise.resolve({} as MediaStream)
} as any

// Mock SpeechRecognition
global.SpeechRecognition = class SpeechRecognition {
  continuous = false
  interimResults = false
  lang = 'en-US'
  onresult = null
  onstart = null
  onend = null
  onerror = null
  
  start() {}
  stop() {}
  abort() {}
} as any

global.webkitSpeechRecognition = global.SpeechRecognition