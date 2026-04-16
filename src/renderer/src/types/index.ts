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

export const TAG_COLORS = [
  '#5e5ce6', // indigo
  '#30d158', // green
  '#ff9f0a', // orange
  '#ff453a', // red
  '#64d2ff', // blue
  '#bf5af2', // purple
  '#ff375f', // pink
  '#ffd60a'  // yellow
]
