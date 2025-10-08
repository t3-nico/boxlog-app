'use client'

import { useState } from 'react'

import { Edit3, ExternalLink, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface Document {
  id: string
  name: string
  type: 'text' | 'url' | 'file'
  content?: string
  url?: string
  createdAt: Date
}

interface ChatHistoryItem {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
}

export const AIChatSidebarSections = ({ collapsed }: { collapsed: boolean }) => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'BoxLog User Guide',
      type: 'text',
      content: 'Sample user guide content...',
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'API Documentation',
      type: 'url',
      url: 'https://docs.boxlog.com/api',
      createdAt: new Date(),
    },
    {
      id: '3',
      name: 'Release Notes',
      type: 'file',
      createdAt: new Date(),
    },
  ])

  const [chatHistory] = useState<ChatHistoryItem[]>([
    {
      id: '1',
      title: 'Task Management Help',
      lastMessage: 'How do I organize my tasks effectively?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: '2',
      title: 'Calendar Integration',
      lastMessage: 'Setting up calendar sync with Google Calendar',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: '3',
      title: 'Productivity Analytics',
      lastMessage: 'Analyzing my productivity patterns',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
  ])

  const [showAddDocument, setShowAddDocument] = useState(false)
  const [newDocument, setNewDocument] = useState({
    name: '',
    type: 'text' as Document['type'],
    content: '',
    url: '',
  })

  const handleAddDocument = () => {
    if (!newDocument.name) return

    const doc: Document = {
      id: Date.now().toString(),
      name: newDocument.name,
      type: newDocument.type,
      createdAt: new Date(),
    }

    if (newDocument.type === 'text') {
      doc.content = newDocument.content
    } else if (newDocument.type === 'url') {
      doc.url = newDocument.url
    }

    setDocuments([...documents, doc])
    setNewDocument({ name: '', type: 'text', content: '', url: '' })
    setShowAddDocument(false)
  }

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id))
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return `${days}d ago`
    }
  }

  if (collapsed) {
    return null
  }

  return (
    <>
      {/* Resources Section */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-foreground text-sm font-medium">Resources</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddDocument(!showAddDocument)}
            className="h-6 w-6 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {showAddDocument != null && (
          <div className="bg-accent/30 mb-4 space-y-2 rounded-lg p-3">
            <input
              type="text"
              placeholder="Document name"
              value={newDocument.name}
              onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
              className="bg-background border-border w-full rounded border px-2 py-1 text-xs"
            />
            <select
              value={newDocument.type}
              onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value as Document['type'] })}
              className="bg-background border-border w-full rounded border px-2 py-1 text-xs"
            >
              <option value="text">Text Content</option>
              <option value="url">URL</option>
              <option value="file">File Upload</option>
            </select>

            {newDocument.type === 'text' && (
              <textarea
                placeholder="Enter content..."
                value={newDocument.content}
                onChange={(e) => setNewDocument({ ...newDocument, content: e.target.value })}
                className="bg-background border-border h-16 w-full resize-none rounded border px-2 py-1 text-xs"
              />
            )}

            {newDocument.type === 'url' && (
              <input
                type="url"
                placeholder="Enter URL..."
                value={newDocument.url}
                onChange={(e) => setNewDocument({ ...newDocument, url: e.target.value })}
                className="bg-background border-border w-full rounded border px-2 py-1 text-xs"
              />
            )}

            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddDocument} className="h-6 text-xs">
                Add
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAddDocument(false)} className="h-6 text-xs">
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="hover:bg-accent/50 group flex items-center justify-between rounded-lg p-2 transition-colors"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                <div className="min-w-0 flex-1">
                  <div className="text-foreground truncate text-xs font-medium">{doc.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {doc.type === 'url' ? 'URL' : doc.type === 'file' ? 'File' : 'Text'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {doc.type === 'url' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(doc.url, '_blank')}
                    className="h-5 w-5 p-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat History Section */}
      <div>
        <div className="mb-3">
          <h3 className="text-foreground text-sm font-medium">Chat History</h3>
        </div>

        <div className="space-y-1">
          {chatHistory.map((chat) => (
            <div key={chat.id} className="hover:bg-accent/50 cursor-pointer rounded-lg p-2 transition-colors">
              <div className="text-foreground mb-1 truncate text-xs font-medium">{chat.title}</div>
              <div className="text-muted-foreground mb-1 truncate text-xs">{chat.lastMessage}</div>
              <div className="text-muted-foreground text-xs">{formatTimestamp(chat.timestamp)}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
