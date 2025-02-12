import { useState } from 'react'
import AudioPlayer from './components/AudioPlayer'
import { tracks, trackData } from './data/tracks'
import { Play } from 'lucide-react'

function App() {
  const [hoveredTrackId, setHoveredTrackId] = useState<trackData['id'] | null>(
    null
  )
  const [currentTrackId, setCurrentTrackId] = useState<trackData['id'] | null>(
    null
  )

  const currentTrack = tracks.find((track) => track.id === currentTrackId)

  const handleNext = () => {
    if (currentTrackId) {
      const currentIndex = tracks.findIndex(
        (track) => track.id === currentTrackId
      )
      if (currentIndex < tracks.length - 1) {
        setCurrentTrackId(tracks[currentIndex + 1].id)
      }
    }
  }

  const handlePrevious = () => {
    if (currentTrackId) {
      const currentIndex = tracks.findIndex(
        (track) => track.id === currentTrackId
      )
      if (currentIndex > 0) {
        setCurrentTrackId(tracks[currentIndex - 1].id)
      }
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <h1 className="text-3xl text-amber-700 my-8">nice audio player</h1>
      <div className="w-1/2">
        {tracks.map((track) => (
          <button
            key={track.id}
            onClick={() => setCurrentTrackId(track.id)}
            onMouseEnter={() => setHoveredTrackId(track.id)}
            onMouseLeave={() => setHoveredTrackId(null)}
            className={`grid grid-flow-col grid-cols-4 border border-gray-300 w-full px-4 py-1 my-1 rounded-xl hover:bg-amber-100 cursor-pointer ${
              currentTrackId === track.id ? 'bg-amber-100' : ''
            }`}
          >
            <div className="text-lg text-gray-800 font-semibold text-start">
              {track.title}
            </div>
            <div className="col-span-2 grid grid-flow-col grid-cols-3 gap-x-2">
              <div className="text-gray-700">{track.length}</div>
              <div className="text-gray-700">{track.key}</div>
              <div className="text-gray-700 text-end">{track.bpm}</div>
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
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </div>
  )
}

export default App
