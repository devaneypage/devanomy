import { ElectronAPI } from '@electron-toolkit/preload'

interface Note {
  id: string
  title: string
  content: string
  created_at: number
  updated_at: number
  tag_ids: string[]
}

interface Tag {
  id: string
  name: string
  color: string
}

interface Api {
  notes: {
    list: (tagId?: string) => Promise<Note[]>
    create: () => Promise<Note>
    update: (id: string, title: string, content: string) => Promise<Note>
    delete: (id: string) => Promise<void>
    search: (query: string) => Promise<Note[]>
    addTag: (noteId: string, tagId: string) => Promise<Note>
    removeTag: (noteId: string, tagId: string) => Promise<Note>
  }
  tags: {
    list: () => Promise<Tag[]>
    create: (name: string, color: string) => Promise<Tag>
    delete: (id: string) => Promise<void>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
