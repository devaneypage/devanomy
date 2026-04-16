import { useState, useEffect, useCallback } from 'react'
import { Note, Tag } from './types'
import { TagPanel } from './components/TagPanel/TagPanel'
import { NotesList } from './components/NotesList/NotesList'
import { NoteEditor } from './components/NoteEditor/NoteEditor'
import './App.css'

export default function App(): JSX.Element {
  const [notes, setNotes] = useState<Note[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const api = window.api

  const loadNotes = useCallback(
    async (tagId?: string, query?: string) => {
      if (query && query.trim()) {
        const results = await api.notes.search(query)
        setNotes(results)
      } else {
        const results = await api.notes.list(tagId)
        setNotes(results)
      }
    },
    [api]
  )

  const loadTags = useCallback(async () => {
    const result = await api.tags.list()
    setTags(result)
  }, [api])

  useEffect(() => {
    loadTags()
    loadNotes()
  }, [])

  useEffect(() => {
    loadNotes(selectedTagId ?? undefined, searchQuery)
  }, [selectedTagId, searchQuery])

  async function handleCreateNote(): Promise<void> {
    const note = await api.notes.create()
    setSelectedTagId(null)
    setSearchQuery('')
    await loadNotes()
    setSelectedNoteId(note.id)
  }

  async function handleDeleteNote(noteId: string): Promise<void> {
    await api.notes.delete(noteId)
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null)
    }
    await loadNotes(selectedTagId ?? undefined, searchQuery)
  }

  async function handleUpdateNote(id: string, title: string, content: string): Promise<void> {
    const updated = await api.notes.update(id, title, content)
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updated } : n))
    )
  }

  async function handleCreateTag(name: string, color: string): Promise<void> {
    await api.tags.create(name, color)
    await loadTags()
  }

  async function handleDeleteTag(tagId: string): Promise<void> {
    await api.tags.delete(tagId)
    if (selectedTagId === tagId) {
      setSelectedTagId(null)
    }
    await loadTags()
    await loadNotes(selectedTagId ?? undefined, searchQuery)
  }

  async function handleAddTag(noteId: string, tagId: string): Promise<void> {
    const updated = await api.notes.addTag(noteId, tagId)
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, ...updated } : n)))
  }

  async function handleRemoveTag(noteId: string, tagId: string): Promise<void> {
    const updated = await api.notes.removeTag(noteId, tagId)
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, ...updated } : n)))
  }

  function handleSelectTag(tagId: string | null): void {
    setSelectedTagId(tagId)
    setSearchQuery('')
    setSelectedNoteId(null)
  }

  function handleSearch(query: string): void {
    setSearchQuery(query)
    if (query) setSelectedTagId(null)
  }

  const selectedNote = notes.find((n) => n.id === selectedNoteId) ?? null

  return (
    <div className="app-layout">
      <TagPanel
        tags={tags}
        selectedTagId={selectedTagId}
        onSelectTag={handleSelectTag}
        onCreateTag={handleCreateTag}
        onDeleteTag={handleDeleteTag}
        noteCount={notes.length}
      />
      <NotesList
        notes={notes}
        tags={tags}
        selectedNoteId={selectedNoteId}
        selectedTagId={selectedTagId}
        onSelectNote={(note) => setSelectedNoteId(note.id)}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />
      <NoteEditor
        note={selectedNote}
        tags={tags}
        onUpdate={handleUpdateNote}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
      />
    </div>
  )
}
