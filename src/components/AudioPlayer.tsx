import { useEffect, useState } from 'react'
import { AudioController } from '../utils/audioController'
import { Play, Pause, Repeat, Volume2 } from 'lucide-react'
import { trackData } from '../data/tracks'

interface AudioPlayerProps {
  currentTrack?: trackData
  isPlaying: boolean
  isLooping: boolean
  onPlayPause: (playing: boolean) => void
  onLoopChange: (looping: boolean) => void
}

const audioController = new AudioController()

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentTrack,
  isPlaying,
  isLooping,
  onPlayPause,
  onLoopChange,
}) => {
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0.0)

  // Load track
  useEffect(() => {
    if (currentTrack) {
      audioController.loadTrack(currentTrack.src).then(() => {
        setCurrentTime(0)
        if (isPlaying) {
          audioController.play()
        }
        setDuration(currentTrack.length)
      })
    }
  }, [currentTrack])

  useEffect(() => {
    audioController.setLoop(isLooping)
  }, [isLooping])

  // Set up an interval to update the current playback time
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && currentTrack) {
        setCurrentTime(audioController.getCurrentTime())
      }
    }, 100)
    return () => clearInterval(interval)
  }, [isPlaying, currentTrack])

  const handlePlayPause = () => {
    if (isPlaying) {
      audioController.pause()
    } else {
      audioController.play()
    }
    onPlayPause(!isPlaying)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value)
    setVolume(volume)
    audioController.setVolume(volume)
  }

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    audioController.seek(newTime)
  }

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white shadow rounded-2xl w-2/3">
      <div className="flex gap-2">
        <button
          onClick={handlePlayPause}
          className="p-4 bg-amber-100 rounded-full hover:bg-amber-200 disabled:bg-gray-300"
          disabled={!currentTrack}
        >
          {isPlaying ? (
            <Pause size={20} className="text-amber-800" />
          ) : (
            <Play size={20} className="text-amber-800" />
          )}
        </button>
        <button
          onClick={() => onLoopChange(!isLooping)}
          className={`p-4 text-gray-700 rounded-full ${
            isLooping ? 'text-amber-800' : ''
          } hover:bg-amber-100`}
        >
          <Repeat
            size={16}
            className={`${isLooping ? 'text-amber-800' : 'text-gray-500'}`}
          />
        </button>
      </div>

      {currentTrack ? (
        <div className="text-lg text-gray-800 font-semibold text-start">
          {currentTrack.title}
        </div>
      ) : (
        <div className="flex items-center text-gray-500">select a track</div>
      )}

      {currentTrack && duration > 0 && (
        <div className="w-full flex items-center gap-1 mx-4">
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={currentTime}
            onChange={handleSeekChange}
            className="w-full accent-amber-700 cursor-pointer"
          />
          <div className="text-sm text-gray-600">
            <span>{duration}s</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2">
        <Volume2 size={24} className="text-amber-800" />
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
  )
}

export default AudioPlayer
