'use client'

import React from 'react'

import { 
  MessageCircle, 
  MessageSquare, 
  Trash2, 
  Eye,
  Calendar,
  Search
} from 'lucide-react'

import { Heading } from '@/components/custom'
import { Badge } from '@/components/shadcn-ui/badge'
import { Button } from '@/components/shadcn-ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card'
import { Input } from '@/components/shadcn-ui/input'
import { colors, typography, spacing } from '@/config/theme'

export default function ChatHistoryPage() {
  // Mock data - In actual implementation, fetch from appropriate data source
  const chatSessions = [
    {
      id: '1',
      title: 'Calendar sync issues',
      summary: 'Resolving Google Calendar synchronization problems',
      timestamp: '2025-01-10 14:30',
      status: 'resolved' as const,
      messageCount: 12,
      tags: ['sync', 'calendar']
    },
    {
      id: '2',
      title: 'How to delete tasks',
      summary: 'Questions about deleting tasks in board view',
      timestamp: '2025-01-09 09:15',
      status: 'active' as const,
      messageCount: 8,
      tags: ['task management', 'board']
    },
    {
      id: '3',
      title: 'Data export procedures',
      summary: 'How to export data in CSV format',
      timestamp: '2025-01-07 16:45',
      status: 'resolved' as const,
      messageCount: 6,
      tags: ['export', 'data']
    },
    {
      id: '4',
      title: 'Keyboard shortcuts',
      summary: 'List of keyboard shortcuts for efficient work',
      timestamp: '2025-01-05 11:20',
      status: 'resolved' as const,
      messageCount: 4,
      tags: ['shortcuts', 'efficiency']
    },
    {
      id: '5',
      title: 'Changing timezone settings',
      summary: 'How to change timezone in profile settings',
      timestamp: '2025-01-03 13:10',
      status: 'resolved' as const,
      messageCount: 15,
      tags: ['settings', 'timezone']
    },
    {
      id: '6',
      title: 'Mobile app usage',
      summary: 'How to use the app on smartphones',
      timestamp: '2025-01-01 10:30',
      status: 'resolved' as const,
      messageCount: 9,
      tags: ['mobile', 'usage']
    }
  ]

  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'resolved'>('all')

  const filteredSessions = chatSessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: 'active' | 'resolved') => {
    if (status === 'active') {
      return <Badge variant="default" className={colors.primary.DEFAULT}>Active</Badge>
    }
    return <Badge variant="secondary" className={`${colors.semantic.success.light} ${colors.semantic.success.text}`}>Resolved</Badge>
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`mx-auto max-w-6xl ${spacing.page.default}`}>
      <div className={spacing.section.default}>
        <Heading>Chat History</Heading>
        <p className={`${spacing.margin.md} ${colors.text.secondary}`}>
          View and manage your past help chat sessions.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${colors.text.muted}`} />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'resolved'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'All' : status === 'active' ? 'Active' : 'Resolved'}
              {status !== 'all' && (
                <span className={`ml-1 ${typography.body.small}`}>
                  ({chatSessions.filter(s => s.status === status).length})
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Chat Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className={`${spacing.padding.xl} text-center`}>
              <MessageCircle className={`w-12 h-12 ${colors.text.muted} mx-auto ${spacing.margin.md}`} />
              <p className={colors.text.secondary}>
                {searchQuery ? 'No chats found matching your search criteria' : 'No chat history available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {session.status === 'active' ? (
                        <MessageSquare className={`w-5 h-5 ${colors.semantic.info.text}`} />
                      ) : (
                        <MessageCircle className={`w-5 h-5 ${colors.text.muted}`} />
                      )}
                      <CardTitle className={`${typography.heading.h3}`}>
                        {session.title}
                      </CardTitle>
                      {getStatusBadge(session.status)}
                    </div>
                    <p className={`${typography.body.sm} ${colors.text.secondary} ${spacing.margin.sm}`}>
                      {session.summary}
                    </p>
                    <div className={`flex items-center gap-4 ${typography.body.sm} ${colors.text.muted}`}>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(session.timestamp)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {session.messageCount} messages
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className={`${colors.semantic.error.text} ${colors.semantic.error.hover}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-1 flex-wrap">
                  {session.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className={typography.body.small}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Statistics */}
      {chatSessions.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className={`${spacing.padding.md} text-center`}>
              <div className={`${typography.heading.h2} ${colors.text.primary}`}>
                {chatSessions.length}
              </div>
              <div className={`${typography.body.sm} ${colors.text.secondary}`}>
                Total Chats
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className={`${spacing.padding.md} text-center`}>
              <div className={`${typography.heading.h2} ${colors.semantic.info.text}`}>
                {chatSessions.filter(s => s.status === 'active').length}
              </div>
              <div className={`${typography.body.sm} ${colors.text.secondary}`}>
                Active
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className={`${spacing.padding.md} text-center`}>
              <div className={`${typography.heading.h2} ${colors.semantic.success.text}`}>
                {chatSessions.filter(s => s.status === 'resolved').length}
              </div>
              <div className={`${typography.body.sm} ${colors.text.secondary}`}>
                Resolved
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}