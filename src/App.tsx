import { useState, useEffect } from 'react'
import { Play } from 'lucide-react'
import AudioPlayer from './components/AudioPlayer'
import { tracks, trackData } from './data/tracks'
import Waveform from './components/Waveform'

function App() {
  const [hoveredTrackId, setHoveredTrackId] = useState<trackData['id'] | null>(
    null
  )
  const [currentTrackId, setCurrentTrackId] = useState<trackData['id'] | null>(
    null
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLooping, setIsLooping] = useState(false)

  const currentTrack = tracks.find((track) => track.id === currentTrackId)

  // Reset loop state
  useEffect(() => {
    if (currentTrack) {
      setIsLooping(currentTrack.loop)
    } else {
      setIsLooping(false)
    }
  }, [currentTrack])

  const handleTrackClick = (trackId: trackData['id']) => {
    const newTrack = tracks.find((track) => track.id === trackId)

    setCurrentTrackId(trackId)
    setIsPlaying(true)
    if (newTrack) {
      setIsLooping(newTrack.loop)
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-amber-50">
      <h1 className="text-3xl text-amber-700 my-8">nice audio player</h1>
      <div className="w-2/3 mb-4">
        {tracks.map((track) => (
          <button
            key={track.id}
            onClick={() => handleTrackClick(track.id)}
            onMouseEnter={() => setHoveredTrackId(track.id)}
            onMouseLeave={() => setHoveredTrackId(null)}
            className={`grid grid-flow-col grid-cols-4 border border-gray-300 w-full px-4 py-1 my-1 rounded-xl hover:bg-amber-100 cursor-pointer ${
              currentTrackId === track.id ? 'bg-white' : ''
            }`}
          >
            <div className="text-lg text-gray-800 font-semibold text-start">
              {track.title}
            </div>
            <Waveform data={track.waveform.data} />
            <div className="col-span-2 grid grid-flow-col grid-cols-3 gap-x-2">
              <div className="text-gray-700 text-start">{`${track.length}s`}</div>
              <div className="text-gray-700 text-start">{track.key}</div>
              <div className="text-gray-700 text-start">{track.bpm}</div>
            </div>
            <div className="text-gray-500 text-end">
              {hoveredTrackId === track.id || currentTrackId === track.id ? (
                <Play className="inline-block text-green-800" size={20} />
              ) : (
                track.author
              )}
            </div>
          </button>
        ))}
      </div>
      <AudioPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        isLooping={isLooping}
        onPlayPause={setIsPlaying}
        onLoopChange={setIsLooping}
      />
    </div>
  )
}

export default App
