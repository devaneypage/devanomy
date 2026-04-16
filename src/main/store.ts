import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { randomUUID } from 'crypto'

export interface Note {
  id: string
  title: string
  content: string
  created_at: number
  updated_at: number
  tag_ids: string[]
}

export interface Tag {
  id: string
  name: string
  color: string
}

interface StoreData {
  notes: Note[]
  tags: Tag[]
}

class DataStore {
  private filePath: string
  private data: StoreData

  constructor() {
    const userDataPath = app.getPath('userData')
    mkdirSync(userDataPath, { recursive: true })
    this.filePath = join(userDataPath, 'devanomy-data.json')
    this.data = this.load()
  }

  private load(): StoreData {
    if (existsSync(this.filePath)) {
      try {
        return JSON.parse(readFileSync(this.filePath, 'utf-8')) as StoreData
      } catch {
        return { notes: [], tags: [] }
      }
    }
    return { notes: [], tags: [] }
  }

  private save(): void {
    writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8')
  }

  // Notes

  getNotes(tagId?: string): Note[] {
    let notes = this.data.notes
    if (tagId) {
      notes = notes.filter((n) => n.tag_ids.includes(tagId))
    }
    return [...notes].sort((a, b) => b.updated_at - a.updated_at)
  }

  createNote(): Note {
    const note: Note = {
      id: randomUUID(),
      title: 'Untitled',
      content: '',
      created_at: Date.now(),
      updated_at: Date.now(),
      tag_ids: []
    }
    this.data.notes.unshift(note)
    this.save()
    return note
  }

  updateNote(id: string, title: string, content: string): Note | undefined {
    const note = this.data.notes.find((n) => n.id === id)
    if (note) {
      note.title = title
      note.content = content
      note.updated_at = Date.now()
      this.save()
    }
    return note
  }

  deleteNote(id: string): void {
    this.data.notes = this.data.notes.filter((n) => n.id !== id)
    this.save()
  }

  searchNotes(query: string): Note[] {
    const q = query.toLowerCase()
    return this.data.notes
      .filter(
        (n) =>
          n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      )
      .sort((a, b) => b.updated_at - a.updated_at)
  }

  // Tags

  getTags(): Tag[] {
    return [...this.data.tags].sort((a, b) => a.name.localeCompare(b.name))
  }

  createTag(name: string, color: string): Tag {
    const existing = this.data.tags.find(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    )
    if (existing) return existing
    const tag: Tag = { id: randomUUID(), name, color }
    this.data.tags.push(tag)
    this.save()
    return tag
  }

  deleteTag(id: string): void {
    this.data.tags = this.data.tags.filter((t) => t.id !== id)
    this.data.notes.forEach((n) => {
      n.tag_ids = n.tag_ids.filter((tid) => tid !== id)
    })
    this.save()
  }

  // Note-Tag relations

  addTagToNote(noteId: string, tagId: string): Note | undefined {
    const note = this.data.notes.find((n) => n.id === noteId)
    if (note && !note.tag_ids.includes(tagId)) {
      note.tag_ids.push(tagId)
      this.save()
    }
    return note
  }

  removeTagFromNote(noteId: string, tagId: string): Note | undefined {
    const note = this.data.notes.find((n) => n.id === noteId)
    if (note) {
      note.tag_ids = note.tag_ids.filter((tid) => tid !== tagId)
      this.save()
    }
    return note
  }
}

let store: DataStore | null = null

export function getStore(): DataStore {
  if (!store) {
    store = new DataStore()
  }
  return store
}
