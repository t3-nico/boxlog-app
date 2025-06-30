'use client'

import { useEffect, useState } from 'react'

export interface LogEntry {
  id: number
  title: string
  tags: string[]
  memo: string
  date: string // YYYY-MM-DD
  url?: string
}

const logs: LogEntry[] = [
  {
    id: 1,
    title: 'Morning Workout',
    tags: ['work'],
    memo: 'Deadlifts and squats',
    date: '2025-06-28',
  },
  {
    id: 2,
    title: 'Study React Hooks',
    tags: ['study'],
    memo: 'Read about useEffect and custom hooks',
    date: '2025-06-29',
  },
  {
    id: 3,
    title: 'Client Meeting',
    tags: ['work'],
    memo: 'Discussed project requirements',
    date: '2025-06-30',
  },
  {
    id: 4,
    title: 'Grocery Shopping',
    tags: ['personal'],
    memo: 'Bought vegetables and fruits',
    date: '2025-06-30',
  },
  {
    id: 5,
    title: 'Write Blog Post',
    tags: ['study', 'work'],
    memo: 'Drafted article about TypeScript',
    date: '2025-07-01',
  },
]

interface QueryFilters {
  text: string
  tag?: string
  startDate?: string
  endDate?: string
}

function parseQuery(query: string): QueryFilters {
  const tokens = query.trim().split(/\s+/)
  const result: QueryFilters = { text: '' }
  const remaining: string[] = []

  for (const token of tokens) {
    if (token.startsWith('tag:')) {
      result.tag = token.slice(4)
    } else if (token.startsWith('date:')) {
      const value = token.slice(5)
      if (value === 'today') {
        const today = new Date().toISOString().slice(0, 10)
        result.startDate = today
        result.endDate = today
      } else if (value.includes('~')) {
        const [start, end] = value.split('~')
        result.startDate = start
        result.endDate = end
      } else {
        result.startDate = value
        result.endDate = value
      }
    } else {
      remaining.push(token)
    }
  }

  result.text = remaining.join(' ')
  return result
}

function matchLog(log: LogEntry, filters: QueryFilters) {
  if (filters.tag && !log.tags.some((t) => t.toLowerCase().includes(filters.tag!.toLowerCase()))) {
    return false
  }
  if (filters.startDate && filters.endDate) {
    if (log.date < filters.startDate || log.date > filters.endDate) {
      return false
    }
  }
  const text = filters.text.toLowerCase()
  if (text) {
    return (
      log.title.toLowerCase().includes(text) ||
      log.memo.toLowerCase().includes(text) ||
      log.tags.some((t) => t.toLowerCase().includes(text))
    )
  }
  return true
}

export function useLogSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    setLoading(true)
    const handle = setTimeout(() => {
      const filters = parseQuery(query)
      const filtered = logs.filter((log) => matchLog(log, filters))
      setResults(filtered)
      setLoading(false)
    }, 300)

    return () => clearTimeout(handle)
  }, [query, open])

  return { open, setOpen, query, setQuery, results, loading }
}
