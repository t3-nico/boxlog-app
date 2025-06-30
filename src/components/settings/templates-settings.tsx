'use client'

import { useState } from 'react'
import { Heading, Subheading } from '@/components/heading'
import { SettingSection } from '@/components/settings-section'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Textarea } from '@/components/textarea'
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/components/dialog'
import { Badge } from '@/components/badge'

interface Template {
  id: number
  title: string
  tags: string[]
  duration?: string
  notes?: string
}

function TemplateCard({ template, onEdit, onApply }: { template: Template; onEdit: () => void; onApply: () => void }) {
  return (
    <div className="rounded-lg border border-zinc-950/5 p-4 dark:border-white/10">
      <div className="flex items-start justify-between">
        <div>
          <Subheading level={3} className="!text-base">
            {template.title}
          </Subheading>
          <div className="mt-2 flex flex-wrap gap-1">
            {template.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
          {template.duration && <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{template.duration} min</p>}
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={onEdit} size="sm">
            Edit
          </Button>
          <Button type="button" onClick={onApply} size="sm">
            Apply
          </Button>
        </div>
      </div>
      {template.notes && <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{template.notes}</p>}
    </div>
  )
}

function EditTemplateDialog({
  template,
  open,
  onClose,
  onSave,
}: {
  template: Template
  open: boolean
  onClose: () => void
  onSave: (t: Template) => void
}) {
  const [title, setTitle] = useState(template.title)
  const [tags, setTags] = useState(template.tags.join(', '))
  const [duration, setDuration] = useState(template.duration ?? '')
  const [notes, setNotes] = useState(template.notes ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...template, title, tags: tags.split(',').map((t) => t.trim()).filter(Boolean), duration, notes })
  }

  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <DialogTitle>Edit Template</DialogTitle>
        <DialogBody className="space-y-4">
          <Input aria-label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input
            aria-label="Tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2"
          />
          <Input
            aria-label="Duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="minutes"
          />
          <Textarea
            aria-label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
          />
        </DialogBody>
        <DialogActions>
          <Button type="button" outline onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default function TemplatesSettings() {
  const [templates, setTemplates] = useState<Template[]>([
    { id: 1, title: 'Daily Standup', tags: ['work'], duration: '15', notes: '' },
  ])
  const [editing, setEditing] = useState<Template | null>(null)

  const handleSave = (t: Template) => {
    setTemplates((temps) => temps.map((tm) => (tm.id === t.id ? t : tm)))
    setEditing(null)
  }

  const handleApply = () => {
    alert('Template applied')
  }

  const handleCreate = () => {
    const newTemplate: Template = { id: Date.now(), title: 'New Template', tags: [], duration: '', notes: '' }
    setTemplates((temps) => [...temps, newTemplate])
    setEditing(newTemplate)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <Heading>Task Templates</Heading>

      <SettingSection title="Templates" description="Save and reuse task setups.">
        <div className="space-y-4 px-4 py-4">
          <Button type="button" onClick={handleCreate}>
            New Template
          </Button>
          <div className="space-y-4">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={() => setEditing(template)}
                onApply={handleApply}
              />
            ))}
          </div>
        </div>
      </SettingSection>

      {editing && (
        <EditTemplateDialog template={editing} open={true} onClose={() => setEditing(null)} onSave={handleSave} />
      )}
    </div>
  )
}
