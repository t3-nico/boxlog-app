'use client'

import React from 'react'
import { Heading } from '@/components/heading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MessageCircle, 
  MessageSquare, 
  Clock, 
  Trash2, 
  Eye,
  Calendar,
  Search
} from 'lucide-react'
import { Input } from '@/components/ui/input'

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
      return <Badge variant="default" className="bg-blue-500">Active</Badge>
    }
    return <Badge variant="secondary" className="bg-green-100 text-green-800">Resolved</Badge>
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
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-8">
        <Heading>Chat History</Heading>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          View and manage your past help chat sessions.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                <span className="ml-1 text-xs">
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
            <CardContent className="py-12 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
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
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                      ) : (
                        <MessageCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <CardTitle className="text-lg font-semibold">
                        {session.title}
                      </CardTitle>
                      {getStatusBadge(session.status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {session.summary}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
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
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-1 flex-wrap">
                  {session.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
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
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {chatSessions.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Chats
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {chatSessions.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {chatSessions.filter(s => s.status === 'resolved').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Resolved
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}