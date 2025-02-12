import React, { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Repeat,
} from 'lucide-react'
import { trackData } from '../data/tracks'

interface AudioPlayerProps {
  currentTrack?: trackData
  onNext?: () => void
  onPrevious?: () => void
}

const AudioPlayer = ({
  currentTrack,
  onNext,
  onPrevious,
}: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isLooping, setIsLooping] = useState(false)

  // Refs for Web Audio API
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const audioBufferRef = useRef<AudioBuffer | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedAtRef = useRef<number>(0)

  // Timer ref for updating current time
  const timeUpdateRef = useRef<number>()

  useEffect(() => {
    // Initialize Audio Context
    audioContextRef.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)()
    gainNodeRef.current = audioContextRef.current.createGain()
    gainNodeRef.current.connect(audioContextRef.current.destination)

    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close()
      }
    }
  }, [])

  useEffect(() => {
    if (currentTrack) {
      loadAudio()
      togglePlay()
    }
    return () => {
      sourceNodeRef.current?.stop()
      if (timeUpdateRef.current) {
        cancelAnimationFrame(timeUpdateRef.current)
      }
    }
  }, [currentTrack])

  const loadAudio = async () => {
    if (!currentTrack || !audioContextRef.current) return

    setIsPlaying(false)
    setCurrentTime(0)
    pausedAtRef.current = 0

    try {
      const response = await fetch(currentTrack.src)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioContextRef.current.decodeAudioData(
        arrayBuffer
      )
      audioBufferRef.current = audioBuffer
      setDuration(audioBuffer.duration)
    } catch (error) {
      console.error('Error loading audio:', error)
    }
  }

  const createAndStartSource = (startFrom: number = 0) => {
    if (
      !audioContextRef.current ||
      !audioBufferRef.current ||
      !gainNodeRef.current
    )
      return

    sourceNodeRef.current?.stop()
    sourceNodeRef.current = audioContextRef.current.createBufferSource()
    sourceNodeRef.current.buffer = audioBufferRef.current
    sourceNodeRef.current.loop = isLooping
    sourceNodeRef.current.connect(gainNodeRef.current)

    startTimeRef.current = audioContextRef.current.currentTime - startFrom
    sourceNodeRef.current.start(0, startFrom)
  }

  const updatePlaybackTime = () => {
    if (!audioContextRef.current || !isPlaying) return

    const currentTime =
      audioContextRef.current.currentTime - startTimeRef.current
    setCurrentTime(currentTime)

    timeUpdateRef.current = requestAnimationFrame(updatePlaybackTime)
  }

  const togglePlay = () => {
    if (!audioContextRef.current || !audioBufferRef.current) return

    if (isPlaying) {
      sourceNodeRef.current?.stop()
      pausedAtRef.current =
        audioContextRef.current.currentTime - startTimeRef.current
      cancelAnimationFrame(timeUpdateRef.current!)
    } else {
      createAndStartSource(pausedAtRef.current)
      requestAnimationFrame(updatePlaybackTime)
    }

    setIsPlaying(!isPlaying)
  }

  const toggleLoop = () => {
    setIsLooping(!isLooping)
    if (sourceNodeRef.current) {
      sourceNodeRef.current.loop = !isLooping
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value)
    pausedAtRef.current = seekTime
    setCurrentTime(seekTime)

    if (isPlaying) {
      createAndStartSource(seekTime)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-4 mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">
            {currentTrack?.title || 'No track selected'}
          </h3>
          <p className="text-sm text-gray-600">{currentTrack?.author}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Volume2 size={20} className="text-gray-600" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.01"
            value={currentTime}
            onChange={handleSeek}
            className="flex-1"
          />
          <span className="text-sm text-gray-600">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onPrevious}
            className="p-2 text-gray-600 hover:text-gray-800"
            disabled={!onPrevious}
          >
            <SkipBack size={24} />
          </button>

          <button
            onClick={togglePlay}
            className="p-3 bg-amber-100 rounded-full hover:bg-amber-200"
            disabled={!currentTrack}
          >
            {isPlaying ? (
              <Pause size={24} className="text-amber-800" />
            ) : (
              <Play size={24} className="text-amber-800" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-2 text-gray-600 hover:text-gray-800"
            disabled={!onNext}
          >
            <SkipForward size={24} />
          </button>

          <button
            onClick={toggleLoop}
            className={`p-2 ${
              isLooping ? 'text-amber-800' : 'text-gray-600'
            } hover:text-amber-800`}
            disabled={!currentTrack}
          >
            <Repeat size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AudioPlayer
