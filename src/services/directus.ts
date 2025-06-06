import axios from 'axios'

const DIRECTUS_BASE_URL = 'http://localhost:8055'

const directusApi = axios.create({
  baseURL: DIRECTUS_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface DirectusFile {
  id: string
  filename_download: string
  title?: string
  type: string
  filesize: number
}

export interface DirectusTrack {
  id: number
  title: string
  author?: string
  bpm?: string
  key?: string
  length?: number
  loop?: boolean
  audio_file?: DirectusFile
  waveform_data?: number[]
}

export interface DirectusTracksResponse {
  data: DirectusTrack[]
}

export const directusService = {
  async getTracks(): Promise<DirectusTrack[]> {
    try {
      const response = await directusApi.get<DirectusTracksResponse>(
        '/items/tracks?fields=*,audio_file.*'
      )
      return response.data.data
    } catch (error) {
      console.error('Error fetching tracks from Directus:', error)
      throw error
    }
  },

  getFileUrl(fileId: string): string {
    return `${DIRECTUS_BASE_URL}/assets/${fileId}`
  },

  async getFile(fileId: string): Promise<DirectusFile> {
    try {
      const response = await directusApi.get<{ data: DirectusFile }>(
        `/files/${fileId}`
      )
      return response.data.data
    } catch (error) {
      console.error('Error fetching file from Directus:', error)
      throw error
    }
  },
}
