'use client'

import { useState } from 'react'
import { Heading } from '@/components/heading'
import { SettingSection } from '@/components/settings-section'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from '@/components/ui/table'

interface Tag {
  id: number
  name: string
  color: string
  count: number
}

function TagItem({ tag, onEdit, onDelete }: { tag: Tag; onEdit: () => void; onDelete: () => void }) {
  return (
    <TableRow>
      <TableCell>{tag.name}</TableCell>
      <TableCell>
        <span className="inline-block size-4 rounded" style={{ backgroundColor: tag.color }} />
      </TableCell>
      <TableCell>{tag.count}</TableCell>
      <TableCell className="flex gap-2">
        <Button type="button" onClick={onEdit}>
          Edit
        </Button>
        <Button
          type="button"
          onClick={onDelete}
          className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  )
}

function EditTagDialog({
  tag,
  open,
  onClose,
  onSave,
}: {
  tag: Tag
  open: boolean
  onClose: () => void
  onSave: (tag: Tag) => void
}) {
  const [name, setName] = useState(tag.name)
  const [color, setColor] = useState(tag.color)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...tag, name, color })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Input aria-label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input
              type="color"
              aria-label="Color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-16 p-0"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function NewTagForm({ onCreate }: { onCreate: (tag: Omit<Tag, 'id' | 'count'>) => void }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3b82f6')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    onCreate({ name, color })
    setName('')
    setColor('#3b82f6')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-4">
      <div className="flex-1">
        <Input
          aria-label="Tag name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tag name"
          required
        />
      </div>
      <Input
        type="color"
        aria-label="Color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="h-10 w-16 p-0"
      />
      <Button type="submit">Add</Button>
    </form>
  )
}

export default function TagsSettings() {
  const [tags, setTags] = useState<Tag[]>([
    { id: 1, name: 'Work', color: '#3b82f6', count: 5 },
    { id: 2, name: 'Personal', color: '#ef4444', count: 2 },
  ])
  const [editing, setEditing] = useState<Tag | null>(null)

  const handleEdit = (updated: Tag) => {
    setTags((tags) => tags.map((t) => (t.id === updated.id ? updated : t)))
    setEditing(null)
  }

  const handleDelete = (tag: Tag) => {
    if (tag.count > 0) {
      alert('This tag is currently in use and cannot be deleted.')
      return
    }
    setTags((tags) => tags.filter((t) => t.id !== tag.id))
  }

  const handleCreate = (tag: Omit<Tag, 'id' | 'count'>) => {
    setTags((tags) => [...tags, { id: Date.now(), count: 0, ...tag }])
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <Heading>Tags</Heading>

      <SettingSection title="Manage Tags" description="Create and edit tag presets.">
        <div className="space-y-4 px-4 py-4">
          <NewTagForm onCreate={handleCreate} />
          <Table className="[--gutter:--spacing(2)]">
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader>Color</TableHeader>
                <TableHeader>Usage</TableHeader>
                <TableHeader></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {tags.map((tag) => (
                <TagItem
                  key={tag.id}
                  tag={tag}
                  onEdit={() => setEditing(tag)}
                  onDelete={() => handleDelete(tag)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </SettingSection>

      {editing && (
        <EditTagDialog tag={editing} open={true} onClose={() => setEditing(null)} onSave={handleEdit} />
      )}
    </div>
  )
}
