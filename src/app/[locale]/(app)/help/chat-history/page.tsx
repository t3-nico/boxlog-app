'use client'

import React from 'react'

import { Calendar, Eye, MessageCircle, MessageSquare, Search, Trash2 } from 'lucide-react'

import { Heading } from '@/components/app'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/features/i18n/lib/hooks'

const ChatHistoryPage = () => {
  const { t } = useI18n()

  // Mock data - In actual implementation, fetch from appropriate data source
  const chatSessions = [
    {
      id: '1',
      title: 'Calendar sync issues',
      summary: 'Resolving Google Calendar synchronization problems',
      timestamp: '2025-01-10 14:30',
      status: 'resolved' as const,
      messageCount: 12,
      tags: ['sync', 'calendar'],
    },
    {
      id: '2',
      title: 'How to delete tasks',
      summary: 'Questions about deleting tasks in board view',
      timestamp: '2025-01-09 09:15',
      status: 'active' as const,
      messageCount: 8,
      tags: ['task management', 'board'],
    },
    {
      id: '3',
      title: 'Data export procedures',
      summary: 'How to export data in CSV format',
      timestamp: '2025-01-07 16:45',
      status: 'resolved' as const,
      messageCount: 6,
      tags: ['export', 'data'],
    },
    {
      id: '4',
      title: 'Keyboard shortcuts',
      summary: 'List of keyboard shortcuts for efficient work',
      timestamp: '2025-01-05 11:20',
      status: 'resolved' as const,
      messageCount: 4,
      tags: ['shortcuts', 'efficiency'],
    },
    {
      id: '5',
      title: 'Changing timezone settings',
      summary: 'How to change timezone in profile settings',
      timestamp: '2025-01-03 13:10',
      status: 'resolved' as const,
      messageCount: 15,
      tags: ['settings', 'timezone'],
    },
    {
      id: '6',
      title: 'Mobile app usage',
      summary: 'How to use the app on smartphones',
      timestamp: '2025-01-01 10:30',
      status: 'resolved' as const,
      messageCount: 9,
      tags: ['mobile', 'usage'],
    },
  ]

  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'resolved'>('all')

  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleAllFilter = React.useCallback(() => {
    setStatusFilter('all')
  }, [])

  const handleActiveFilter = React.useCallback(() => {
    setStatusFilter('active')
  }, [])

  const handleResolvedFilter = React.useCallback(() => {
    setStatusFilter('resolved')
  }, [])

  const filteredSessions = chatSessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || session.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: 'active' | 'resolved') => {
    if (status === 'active') {
      return <Badge variant="default">{t('filters.active')}</Badge>
    }
    return <Badge variant="secondary">{t('filters.resolved')}</Badge>
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <Heading>{t('title')}</Heading>
        <p className="mt-4 text-neutral-800 dark:text-neutral-200">{t('description')}</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-neutral-600 dark:text-neutral-400" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={handleAllFilter}>
            {t('filters.all')}
          </Button>
          <Button variant={statusFilter === 'active' ? 'default' : 'outline'} size="sm" onClick={handleActiveFilter}>
            {t('filters.active')}
            <span className="ml-1 text-sm">({chatSessions.filter((s) => s.status === 'active').length})</span>
          </Button>
          <Button
            variant={statusFilter === 'resolved' ? 'default' : 'outline'}
            size="sm"
            onClick={handleResolvedFilter}
          >
            {t('filters.resolved')}
            <span className="ml-1 text-sm">({chatSessions.filter((s) => s.status === 'resolved').length})</span>
          </Button>
        </div>
      </div>

      {/* Chat Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="mx-auto mb-4 h-12 w-12 text-neutral-600 dark:text-neutral-400" />
              <p className="text-neutral-800 dark:text-neutral-200">
                {searchQuery ? t('empty.noMatch') : t('empty.noChats')}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => (
            <Card key={session.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      {session.status === 'active' ? (
                        <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                      ) : (
                        <MessageCircle className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                      )}
                      <CardTitle className="text-2xl font-semibold">{session.title}</CardTitle>
                      {getStatusBadge(session.status)}
                    </div>
                    <p className="mb-2 text-sm text-neutral-800 dark:text-neutral-200">{session.summary}</p>
                    <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(session.timestamp)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {session.messageCount} {t('labels.messages')}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-1 h-4 w-4" />
                      {t('actions.view')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1">
                  {session.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-sm">
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
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                {chatSessions.length}
              </div>
              <div className="text-sm text-neutral-800 dark:text-neutral-200">{t('stats.totalChats')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-500">
                {chatSessions.filter((s) => s.status === 'active').length}
              </div>
              <div className="text-sm text-neutral-800 dark:text-neutral-200">{t('stats.active')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-500">
                {chatSessions.filter((s) => s.status === 'resolved').length}
              </div>
              <div className="text-sm text-neutral-800 dark:text-neutral-200">{t('stats.resolved')}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ChatHistoryPage
