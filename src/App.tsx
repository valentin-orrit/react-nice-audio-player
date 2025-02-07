import AudioPlayer from './components/AudioPlayer'

function App() {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <h1 className="text-3xl text-amber-700">nice audio player</h1>
      <AudioPlayer />
    </div>
  )
}

export default App
