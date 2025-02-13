import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, Repeat } from 'lucide-react'
import { trackData } from '../data/tracks'

interface AudioPlayerProps {
  currentTrack?: trackData
  isPlaying: boolean
  isLooping: boolean
  onPlayPause: (isPlaying: boolean) => void
  onLoopChange: (isLooping: boolean) => void
  onNext?: () => void
  onPrevious?: () => void
}

const AudioPlayer = ({
  currentTrack,
  isPlaying,
  isLooping,
  onPlayPause,
  onLoopChange,
}: AudioPlayerProps) => {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  // Refs for Web Audio API
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const audioBufferRef = useRef<AudioBuffer | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedAtRef = useRef<number>(0)
  const timeUpdateRef = useRef<number>(0)

  useEffect(() => {
    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close()
      }
    }
  }, [])

  // Reset and load audio when track changes
  useEffect(() => {
    if (currentTrack) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop()
      }
      pausedAtRef.current = 0
      setCurrentTime(0)
      setDuration(0)
      audioBufferRef.current = null
      loadAudio()
    }
    return () => {
      sourceNodeRef.current?.stop()
      if (timeUpdateRef.current) {
        cancelAnimationFrame(timeUpdateRef.current)
      }
    }
  }, [currentTrack])

  // Handle play state changes
  useEffect(() => {
    if (audioBufferRef.current) {
      if (isPlaying) {
        createAndStartSource(pausedAtRef.current)
        requestAnimationFrame(updatePlaybackTime)
      } else {
        sourceNodeRef.current?.stop()
        pausedAtRef.current = currentTime
        cancelAnimationFrame(timeUpdateRef.current)
      }
    }
  }, [isPlaying])

  // Handle loop state changes
  useEffect(() => {
    if (sourceNodeRef.current && isPlaying) {
      createAndStartSource(currentTime)
    }
  }, [isLooping])

  const loadAudio = async () => {
    if (!currentTrack || !audioContextRef.current) return

    try {
      const response = await fetch(currentTrack.src)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioContextRef.current.decodeAudioData(
        arrayBuffer
      )
      audioBufferRef.current = audioBuffer
      setDuration(audioBuffer.duration)

      if (isPlaying) {
        createAndStartSource(0)
        requestAnimationFrame(updatePlaybackTime)
      }
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

    if (!isLooping) {
      sourceNodeRef.current.onended = () => {
        onPlayPause(false)
        setCurrentTime(0)
        pausedAtRef.current = 0
      }
    }

    startTimeRef.current = audioContextRef.current.currentTime - startFrom
    sourceNodeRef.current.start(0, startFrom)
  }

  const initializeAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)()
      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.connect(audioContextRef.current.destination)
    }
  }

  const togglePlay = async () => {
    initializeAudioContext()

    if (!audioContextRef.current) return

    if (!audioBufferRef.current && currentTrack) {
      await loadAudio()
    }

    onPlayPause(!isPlaying)
  }

  const updatePlaybackTime = () => {
    if (!audioContextRef.current || !isPlaying) return

    const currentTime =
      audioContextRef.current.currentTime - startTimeRef.current

    if (audioBufferRef.current) {
      const normalizedTime = isLooping
        ? currentTime % audioBufferRef.current.duration
        : Math.min(currentTime, audioBufferRef.current.duration)
      setCurrentTime(normalizedTime)
    }

    timeUpdateRef.current = requestAnimationFrame(updatePlaybackTime)
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

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-4 mt-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center gap-4">
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
            onClick={() => currentTrack && onLoopChange(!isLooping)}
            className={`p-2 rounded-full hover:bg-amber-100 ${
              isLooping ? 'bg-amber-100' : ''
            }`}
            disabled={!currentTrack}
          >
            <Repeat
              size={20}
              className={`${
                !currentTrack
                  ? 'text-gray-300'
                  : isLooping
                  ? 'text-amber-800'
                  : 'text-gray-400'
              }`}
            />
          </button>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">
          {currentTrack?.title || 'No track selected'}
        </h3>
        <p className="text-sm text-gray-600">{currentTrack?.author}</p>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.01"
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 accent-amber-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <Volume2 size={20} className="text-gray-600" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 accent-amber-700"
          />
        </div>
      </div>
    </div>
  )
}

export default AudioPlayer
