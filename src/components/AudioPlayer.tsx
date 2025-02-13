import { useEffect, useState } from 'react'
import { AudioController } from '../utils/audioUtils'
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

  useEffect(() => {
    if (currentTrack) {
      audioController.loadTrack(currentTrack.src).then(() => {
        if (isPlaying) {
          audioController.play()
        }
      })
    }
  }, [currentTrack])

  useEffect(() => {
    audioController.setLoop(isLooping)
  }, [isLooping])

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

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white shadow rounded-xl w-2/3">
      <div className="flex gap-2">
        <button
          onClick={handlePlayPause}
          className="p-4 bg-amber-100 rounded-full hover:bg-amber-200 disabled:bg-gray-300"
          disabled={!currentTrack}
        >
          {isPlaying ? (
            <Pause size={24} className="text-amber-800" />
          ) : (
            <Play size={24} className="text-amber-800" />
          )}
        </button>
        <button
          onClick={() => onLoopChange(!isLooping)}
          className={`p-4 text-gray-700 rounded-full ${
            isLooping ? 'text-amber-800' : ''
          } hover:bg-amber-100`}
        >
          <Repeat
            size={20}
            className={`${isLooping ? 'text-amber-800' : 'text-gray-400'}`}
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
      <div className="flex items-center gap-2">
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
