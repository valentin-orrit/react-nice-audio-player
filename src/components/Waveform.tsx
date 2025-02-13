interface WaveformProps {
  data: number[]
}

const Waveform: React.FC<WaveformProps> = ({ data }) => {
  const width = 100
  const height = 20
  const mid = height / 2

  return (
    <svg width={width} height={height} className="waveform">
      {data.map((value, index) => {
        const x = (index / data.length) * width
        const y = mid + (value / 128) * mid

        return (
          <line
            key={index}
            x1={x}
            y1={mid}
            x2={x}
            y2={y}
            stroke="#bb4d00"
            strokeWidth="1"
          />
        )
      })}
    </svg>
  )
}

export default Waveform
