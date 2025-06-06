import { useState, useEffect } from 'react'
import { Play, Loader2 } from 'lucide-react'
import AudioPlayer from './components/AudioPlayer'
import { tracks as localTracks, trackData } from './data/tracks'
import { directusService } from './services/directus'
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
  const [tracks, setTracks] = useState<trackData[]>(localTracks)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useDirectus, setUseDirectus] = useState(false)

  const currentTrack = tracks.find((track) => track.id === currentTrackId)

  // Load tracks from Directus
  const loadDirectusTracks = async () => {
    setLoading(true)
    setError(null)
    try {
      const directusTracks = await directusService.getTracks()
      const convertedTracks: trackData[] = directusTracks.map((track) => ({
        id: track.id,
        title: track.title,
        author: track.author || 'Unknown',
        bpm: track.bpm || 'Unknown',
        key: track.key || 'Unknown',
        length: track.length || 0,
        src: track.audio_file
          ? directusService.getFileUrl(track.audio_file.id)
          : '',
        loop: track.loop || false,
        waveform: { data: track.waveform_data || [] },
      }))
      setTracks(convertedTracks)
      setUseDirectus(true)
    } catch (err) {
      setError('Failed to load tracks from Directus')
      console.error('Error loading Directus tracks:', err)
    } finally {
      setLoading(false)
    }
  }

  // Switch back to local tracks
  const useLocalTracks = () => {
    setTracks(localTracks)
    setUseDirectus(false)
    setError(null)
  }

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

      {/* Source toggle buttons */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={useLocalTracks}
          className={`px-4 py-2 rounded-lg ${
            !useDirectus
              ? 'bg-amber-200 text-amber-800'
              : 'bg-white text-gray-700'
          } hover:bg-amber-100`}
        >
          Local Files
        </button>
        <button
          onClick={loadDirectusTracks}
          disabled={loading}
          className={`px-4 py-2 rounded-lg ${
            useDirectus
              ? 'bg-amber-200 text-amber-800'
              : 'bg-white text-gray-700'
          } hover:bg-amber-100 disabled:opacity-50`}
        >
          {loading ? (
            <>
              <Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            'Directus'
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

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
              <div className="text-gray-700 text-start">
                {track.key || 'N/A'}
              </div>
              <div className="text-gray-700 text-start">
                {track.bpm || 'N/A'}
              </div>
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
