'use client'

import { useState } from 'react'
import { Heading } from '@/components/heading'
import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { Badge } from '@/components/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/table'
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/20/solid'

interface Task {
  id: number
  title: string
  status: string
  label: string
  priority: string
  completed?: boolean
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Design application UI',
    status: 'In progress',
    label: 'Design',
    priority: 'High',
  },
  {
    id: 2,
    title: 'Implement authentication',
    status: 'Todo',
    label: 'Development',
    priority: 'Medium',
  },
  {
    id: 3,
    title: 'Write unit tests',
    status: 'Backlog',
    label: 'QA',
    priority: 'Low',
  },
  {
    id: 4,
    title: 'Deploy to production',
    status: 'Done',
    label: 'Project',
    priority: 'Medium',
  },
  {
    id: 5,
    title: 'Prepare documentation',
    status: 'Todo',
    label: 'Docs',
    priority: 'Low',
  },
]

function priorityColor(priority: string) {
  switch (priority) {
    case 'High':
      return 'red'
    case 'Medium':
      return 'yellow'
    default:
      return 'zinc'
  }
}

export default function TasksTable() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [sortKey, setSortKey] = useState<keyof Task | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  function toggleSort(key: keyof Task) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function toggleComplete(id: number) {
    setTasks((tasks) =>
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    )
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!sortKey) return 0
    const aVal = a[sortKey] ?? ''
    const bVal = b[sortKey] ?? ''
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  function header(
    label: string,
    key: keyof Task,
    extra?: string
  ) {
    return (
      <TableHeader
        onClick={() => toggleSort(key)}
        className={`cursor-pointer select-none ${extra ?? ''}`.trim()}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {sortKey === key ? (
            sortDir === 'asc' ? (
              <ChevronUpIcon className="size-4" />
            ) : (
              <ChevronDownIcon className="size-4" />
            )
          ) : null}
        </span>
      </TableHeader>
    )
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <Heading>Tasks</Heading>
        <Button className="-my-0.5">Add task</Button>
      </div>
      <Table
        dense
        striped
        className="mt-8 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]"
      >
        <TableHead>
          <TableRow>
            <TableHeader className="w-12" />
            {header('Task', 'title')}
            {header('Status', 'status')}
            {header('Label', 'label')}
            {header('Priority', 'priority', 'text-right')}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedTasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <Checkbox
                  name={`task-${task.id}`}
                  checked={task.completed}
                  onChange={() => toggleComplete(task.id)}
                />
              </TableCell>
              <TableCell className={task.completed ? 'line-through text-zinc-500' : ''}>
                {task.title}
              </TableCell>
              <TableCell>
                <Badge
                  color={
                    task.status === 'Done'
                      ? 'lime'
                      : task.status === 'In progress'
                      ? 'blue'
                      : 'zinc'
                  }
                >
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge>{task.label}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Badge color={priorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
