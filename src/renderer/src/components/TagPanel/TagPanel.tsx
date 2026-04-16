import { useState } from 'react'
import { Tag, TAG_COLORS } from '../../types'
import './TagPanel.css'

interface Props {
  tags: Tag[]
  selectedTagId: string | null
  onSelectTag: (tagId: string | null) => void
  onCreateTag: (name: string, color: string) => void
  onDeleteTag: (tagId: string) => void
  noteCount: number
}

export function TagPanel({
  tags,
  selectedTagId,
  onSelectTag,
  onCreateTag,
  onDeleteTag,
  noteCount
}: Props): JSX.Element {
  const [isAdding, setIsAdding] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0])
  const [hoveredTagId, setHoveredTagId] = useState<string | null>(null)

  function handleAddTag(): void {
    const name = newTagName.trim()
    if (!name) return
    onCreateTag(name, newTagColor)
    setNewTagName('')
    setNewTagColor(TAG_COLORS[0])
    setIsAdding(false)
  }

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === 'Enter') handleAddTag()
    if (e.key === 'Escape') {
      setIsAdding(false)
      setNewTagName('')
    }
  }

  return (
    <aside className="tag-panel">
      <div className="tag-panel-header">
        <span className="tag-panel-logo">devanomy</span>
      </div>

      <nav className="tag-panel-nav">
        <button
          className={`tag-panel-nav-item ${selectedTagId === null ? 'active' : ''}`}
          onClick={() => onSelectTag(null)}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" width="15" height="15">
            <path d="M1.5 3.5A1.5 1.5 0 013 2h10a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 0113 14H3a1.5 1.5 0 01-1.5-1.5v-9zm1 0v9A.5.5 0 003 13h10a.5.5 0 00.5-.5v-9A.5.5 0 0013 3H3a.5.5 0 00-.5.5z"/>
            <path d="M4 6h8M4 9h5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          All Notes
          <span className="tag-panel-count">{noteCount}</span>
        </button>
      </nav>

      <div className="tag-panel-section">
        <div className="tag-panel-section-header">
          <span>Tags</span>
          <button
            className="tag-panel-add-btn"
            onClick={() => setIsAdding(true)}
            title="Add tag"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
              <path d="M8 3.5a.5.5 0 01.5.5v3.5H12a.5.5 0 010 1H8.5V12a.5.5 0 01-1 0V8.5H4a.5.5 0 010-1h3.5V4a.5.5 0 01.5-.5z"/>
            </svg>
          </button>
        </div>

        <ul className="tag-list">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className={`tag-item ${selectedTagId === tag.id ? 'active' : ''}`}
              onMouseEnter={() => setHoveredTagId(tag.id)}
              onMouseLeave={() => setHoveredTagId(null)}
            >
              <button
                className="tag-item-btn"
                onClick={() => onSelectTag(tag.id)}
              >
                <span className="tag-dot" style={{ background: tag.color }} />
                <span className="tag-name">{tag.name}</span>
              </button>
              {hoveredTagId === tag.id && (
                <button
                  className="tag-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteTag(tag.id)
                  }}
                  title="Delete tag"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" width="11" height="11">
                    <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/>
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>

        {isAdding && (
          <div className="tag-add-form">
            <div className="tag-color-picker">
              {TAG_COLORS.map((color) => (
                <button
                  key={color}
                  className={`tag-color-swatch ${newTagColor === color ? 'selected' : ''}`}
                  style={{ background: color }}
                  onClick={() => setNewTagColor(color)}
                />
              ))}
            </div>
            <input
              className="tag-add-input"
              placeholder="Tag name..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <div className="tag-add-actions">
              <button className="tag-add-confirm" onClick={handleAddTag}>Add</button>
              <button
                className="tag-add-cancel"
                onClick={() => {
                  setIsAdding(false)
                  setNewTagName('')
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
