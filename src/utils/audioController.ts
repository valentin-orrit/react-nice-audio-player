export class AudioController {
  private audioContext: AudioContext
  private source: AudioBufferSourceNode | null = null
  private gainNode: GainNode
  private currentBuffer: AudioBuffer | null = null
  private isPlaying: boolean = false
  private loop: boolean = false
  private playbackStartTime: number = 0
  private currentOffset: number = 0

  constructor() {
    this.audioContext = new AudioContext()
    this.gainNode = this.audioContext.createGain()
    this.gainNode.connect(this.audioContext.destination)
  }

  async loadTrack(url: string) {
    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const arrayBuffer = await response.arrayBuffer()
      this.currentBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      this.currentOffset = 0
    } catch (error) {
      console.error('Error loading audio track:', error)
      throw error
    }
  }

  play() {
    if (!this.currentBuffer) return
    this.stop()
    this.source = this.audioContext.createBufferSource()
    this.source.buffer = this.currentBuffer
    this.source.loop = this.loop
    this.source.connect(this.gainNode)
    this.playbackStartTime = this.audioContext.currentTime - this.currentOffset
    this.source.start(0, this.currentOffset)
    this.isPlaying = true
  }

  pause() {
    if (this.isPlaying && this.currentBuffer) {
      this.currentOffset =
        this.audioContext.currentTime - this.playbackStartTime
    }
    this.stop()
    this.isPlaying = false
  }

  stop() {
    if (this.source) {
      this.source.stop()
      this.source.disconnect()
      this.source = null
    }
  }

  setVolume(value: number) {
    this.gainNode.gain.value = value
  }

  setLoop(loop: boolean) {
    this.loop = loop
    if (this.source) {
      this.source.loop = loop
    }
  }

  seek(time: number) {
    if (!this.currentBuffer) return
    this.currentOffset = time
    if (this.isPlaying) {
      this.stop()
      this.source = this.audioContext.createBufferSource()
      this.source.buffer = this.currentBuffer
      this.source.loop = this.loop
      this.source.connect(this.gainNode)
      this.playbackStartTime =
        this.audioContext.currentTime - this.currentOffset
      this.source.start(0, this.currentOffset)
    }
  }

  getCurrentTime() {
    if (this.isPlaying && this.currentBuffer) {
      const elapsed = this.audioContext.currentTime - this.playbackStartTime
      const duration = this.currentBuffer.duration
      return this.loop ? elapsed % duration : Math.min(elapsed, duration)
    }
    return this.currentOffset
  }
}
