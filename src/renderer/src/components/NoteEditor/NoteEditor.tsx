import { useState, useEffect, useRef, useCallback } from 'react'
import { Note, Tag } from '../../types'
import './NoteEditor.css'

interface Props {
  note: Note | null
  tags: Tag[]
  onUpdate: (id: string, title: string, content: string) => void
  onAddTag: (noteId: string, tagId: string) => void
  onRemoveTag: (noteId: string, tagId: string) => void
}

function formatFullDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function NoteEditor({ note, tags, onUpdate, onAddTag, onRemoveTag }: Props): JSX.Element {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [saved, setSaved] = useState(true)

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tagPickerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  // Sync local state when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title === 'Untitled' ? '' : note.title)
      setContent(note.content)
      setSaved(true)
    }
  }, [note?.id])

  const scheduleSave = useCallback(
    (newTitle: string, newContent: string) => {
      if (!note) return
      setSaved(false)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        onUpdate(note.id, newTitle || 'Untitled', newContent)
        setSaved(true)
      }, 800)
    },
    [note, onUpdate]
  )

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setTitle(e.target.value)
    scheduleSave(e.target.value, content)
  }

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    setContent(e.target.value)
    scheduleSave(title, e.target.value)
  }

  // Auto-resize textarea
  function handleContentInput(): void {
    const el = contentRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = el.scrollHeight + 'px'
    }
  }

  // Close tag picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent): void {
      if (tagPickerRef.current && !tagPickerRef.current.contains(e.target as Node)) {
        setShowTagPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Keyboard shortcut: Tab in textarea inserts spaces
  function handleContentKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = contentRef.current
      if (!el) return
      const start = el.selectionStart
      const end = el.selectionEnd
      const newContent = content.substring(0, start) + '  ' + content.substring(end)
      setContent(newContent)
      scheduleSave(title, newContent)
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2
      })
    }
  }

  if (!note) {
    return (
      <div className="note-editor note-editor-empty">
        <div className="note-editor-empty-inner">
          <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
            <rect x="8" y="6" width="32" height="36" rx="3" stroke="currentColor" strokeWidth="2"/>
            <path d="M15 16h18M15 22h18M15 28h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p>Select a note or create a new one</p>
        </div>
      </div>
    )
  }

  const noteTags = tags.filter((t) => note.tag_ids.includes(t.id))
  const availableTags = tags.filter((t) => !note.tag_ids.includes(t.id))

  return (
    <article className="note-editor">
      <div className="note-editor-toolbar">
        <span className="note-editor-date">{formatFullDate(note.updated_at)}</span>
        <span className={`note-editor-saved ${saved ? 'visible' : ''}`}>Saved</span>
      </div>

      <div className="note-editor-scroll">
        <input
          className="note-editor-title"
          placeholder="Untitled"
          value={title}
          onChange={handleTitleChange}
          maxLength={200}
        />

        <div className="note-editor-tags-row" ref={tagPickerRef}>
          {noteTags.map((tag) => (
            <button
              key={tag.id}
              className="note-editor-tag"
              style={{ color: tag.color, borderColor: tag.color + '55' }}
              onClick={() => onRemoveTag(note.id, tag.id)}
              title="Click to remove"
            >
              <span
                className="note-editor-tag-dot"
                style={{ background: tag.color }}
              />
              {tag.name}
              <svg viewBox="0 0 12 12" fill="currentColor" width="10" height="10" className="note-editor-tag-remove">
                <path d="M3.646 3.646a.5.5 0 01.708 0L6 5.293l1.646-1.647a.5.5 0 01.708.708L6.707 6l1.647 1.646a.5.5 0 01-.708.708L6 6.707 4.354 8.354a.5.5 0 01-.708-.708L5.293 6 3.646 4.354a.5.5 0 010-.708z"/>
              </svg>
            </button>
          ))}

          <div className="note-editor-tag-picker-wrap">
            <button
              className="note-editor-add-tag-btn"
              onClick={() => setShowTagPicker((v) => !v)}
            >
              <svg viewBox="0 0 16 16" fill="currentColor" width="11" height="11">
                <path d="M8 3.5a.5.5 0 01.5.5v3.5H12a.5.5 0 010 1H8.5V12a.5.5 0 01-1 0V8.5H4a.5.5 0 010-1h3.5V4a.5.5 0 01.5-.5z"/>
              </svg>
              Add tag
            </button>
            {showTagPicker && (
              <div className="note-editor-tag-picker">
                {availableTags.length === 0 && (
                  <div className="note-editor-tag-picker-empty">
                    {tags.length === 0 ? 'No tags yet. Create one in the sidebar.' : 'All tags applied'}
                  </div>
                )}
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    className="note-editor-tag-picker-item"
                    onClick={() => {
                      onAddTag(note.id, tag.id)
                      setShowTagPicker(false)
                    }}
                  >
                    <span className="tag-dot" style={{ background: tag.color }} />
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="note-editor-divider" />

        <textarea
          ref={contentRef}
          className="note-editor-content"
          placeholder="Start writing..."
          value={content}
          onChange={handleContentChange}
          onInput={handleContentInput}
          onKeyDown={handleContentKeyDown}
          spellCheck
        />
      </div>
    </article>
  )
}
