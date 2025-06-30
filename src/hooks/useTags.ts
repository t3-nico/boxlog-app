import { useState } from 'react'

export interface Tag {
  id: number
  name: string
  color: string
  count: number
}

export default function useTags(initial: Tag[] = []) {
  const [tags, setTags] = useState<Tag[]>(initial)

  const createTag = (tag: Omit<Tag, 'id' | 'count'>) =>
    setTags((prev) => [...prev, { id: Date.now(), count: 0, ...tag }])

  const updateTag = (updated: Tag) =>
    setTags((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))

  const deleteTag = (tag: Tag) => setTags((prev) => prev.filter((t) => t.id !== tag.id))

  return { tags, createTag, updateTag, deleteTag }
}
