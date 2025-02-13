import drumbreak from './drumbreak 21 84bpm [2024-12-21 121900].wav'
import kick from './KICK [2024-11-29 125654].wav'
import snare from './snare 2 [2024-11-29 142701].wav'
import percloop from './perc_loop 6 128bpm [2024-11-30 140924].wav'

export interface trackData {
  id: number
  title: string
  author: string
  bpm: string
  key: string
  length: string
  src: string
  loop: boolean
}

export const tracks = [
  {
    id: 1,
    title: 'kick',
    author: 'val',
    bpm: '150bpm',
    key: 'Cmaj',
    length: '0:01',
    src: kick,
    loop: false,
  },
  {
    id: 2,
    title: 'snare',
    author: 'val',
    bpm: '120bpm',
    key: 'F#min',
    length: '0:01',
    src: snare,
    loop: false,
  },
  {
    id: 3,
    title: 'drumbreak',
    author: 'val',
    bpm: '90bpm',
    key: 'Gmaj',
    length: '0:11',
    src: drumbreak,
    loop: true,
  },
  {
    id: 4,
    title: 'percloop',
    author: 'val',
    bpm: '130bpm',
    key: 'Emin',
    length: '0:03',
    src: percloop,
    loop: true,
  },
]
