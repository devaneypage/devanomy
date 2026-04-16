import { useState, useRef } from 'react'
import { Note, Tag } from '../../types'
import './NotesList.css'

interface Props {
  notes: Note[]
  tags: Tag[]
  selectedNoteId: string | null
  selectedTagId: string | null
  onSelectNote: (note: Note) => void
  onCreateNote: () => void
  onDeleteNote: (noteId: string) => void
  onSearch: (query: string) => void
  searchQuery: string
}

function formatDate(ts: number): string {
  const now = Date.now()
  const diff = now - ts
  const day = 86400000
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < day) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < day * 7) return `${Math.floor(diff / day)}d ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function notePreview(content: string): string {
  const lines = content.split('\n').filter((l) => l.trim())
  return lines[0]?.slice(0, 80) || 'No content'
}

export function NotesList({
  notes,
  tags,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onSearch,
  searchQuery
}: Props): JSX.Element {
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>): void {
    onSearch(e.target.value)
  }

  function getNoteTags(note: Note): Tag[] {
    return tags.filter((t) => note.tag_ids.includes(t.id))
  }

  return (
    <section className="notes-list">
      <div className="notes-list-header">
        <div className="notes-search-wrap">
          <svg className="notes-search-icon" viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
            <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.099zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"/>
          </svg>
          <input
            ref={searchRef}
            className="notes-search"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button
              className="notes-search-clear"
              onClick={() => onSearch('')}
            >
              <svg viewBox="0 0 16 16" fill="currentColor" width="11" height="11">
                <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/>
              </svg>
            </button>
          )}
        </div>
        <button className="notes-new-btn" onClick={onCreateNote} title="New note (Ctrl+N)">
          <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
            <path d="M8 3.5a.5.5 0 01.5.5v3.5H12a.5.5 0 010 1H8.5V12a.5.5 0 01-1 0V8.5H4a.5.5 0 010-1h3.5V4a.5.5 0 01.5-.5z"/>
          </svg>
        </button>
      </div>

      <div className="notes-count">
        {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      <ul className="notes-items">
        {notes.length === 0 && (
          <li className="notes-empty">
            {searchQuery ? 'No notes found' : 'No notes yet'}
          </li>
        )}
        {notes.map((note) => {
          const noteTags = getNoteTags(note)
          return (
            <li
              key={note.id}
              className={`note-item ${selectedNoteId === note.id ? 'active' : ''}`}
              onClick={() => onSelectNote(note)}
              onMouseEnter={() => setHoveredNoteId(note.id)}
              onMouseLeave={() => setHoveredNoteId(null)}
            >
              <div className="note-item-body">
                <div className="note-item-title">
                  {note.title || 'Untitled'}
                </div>
                <div className="note-item-meta">
                  <span className="note-item-date">{formatDate(note.updated_at)}</span>
                  {noteTags.length > 0 && (
                    <div className="note-item-tags">
                      {noteTags.slice(0, 2).map((tag) => (
                        <span
                          key={tag.id}
                          className="note-item-tag"
                          style={{ color: tag.color, borderColor: tag.color + '44' }}
                        >
                          {tag.name}
                        </span>
                      ))}
                      {noteTags.length > 2 && (
                        <span className="note-item-tag-more">+{noteTags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="note-item-preview">{notePreview(note.content)}</div>
              </div>
              {hoveredNoteId === note.id && selectedNoteId !== note.id && (
                <button
                  className="note-item-delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteNote(note.id)
                  }}
                  title="Delete note"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
                    <path d="M6.5 1h3a.5.5 0 01.5.5v1H6v-1a.5.5 0 01.5-.5zM11 2.5v-1A1.5 1.5 0 009.5 0h-3A1.5 1.5 0 005 1.5v1H2.506a.58.58 0 00-.01 0H1.5a.5.5 0 000 1h.538l.853 10.66A2 2 0 004.885 16h6.23a2 2 0 001.994-1.84l.853-10.66h.538a.5.5 0 000-1h-.995a.59.59 0 00-.01 0H11zm1.958 1l-.846 10.58a1 1 0 01-.997.92h-6.23a1 1 0 01-.997-.92L3.042 3.5h9.916z"/>
                  </svg>
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
