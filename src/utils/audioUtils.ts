export class AudioController {
  private audioContext: AudioContext
  private source: AudioBufferSourceNode | null = null
  private gainNode: GainNode
  private currentBuffer: AudioBuffer | null = null
  private isPlaying: boolean = false
  private loop: boolean = false
  private playbackStartTime: number = 0

  constructor() {
    this.audioContext = new AudioContext()
    this.gainNode = this.audioContext.createGain()
    this.gainNode.connect(this.audioContext.destination)
  }

  async loadTrack(url: string) {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    this.currentBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
  }

  play() {
    if (!this.currentBuffer) return
    this.stop()
    this.source = this.audioContext.createBufferSource()
    this.source.buffer = this.currentBuffer
    this.source.loop = this.loop
    this.source.connect(this.gainNode)
    this.source.start()
    this.isPlaying = true
    this.playbackStartTime = this.audioContext.currentTime
  }

  pause() {
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

  getDuration() {
    return this.currentBuffer ? this.currentBuffer.duration : 0
  }

  getCurrentTime() {
    if (!this.isPlaying || !this.currentBuffer) return 0
    const elapsed = this.audioContext.currentTime - this.playbackStartTime
    const duration = this.currentBuffer.duration
    return this.loop ? elapsed % duration : Math.min(elapsed, duration)
  }
}
