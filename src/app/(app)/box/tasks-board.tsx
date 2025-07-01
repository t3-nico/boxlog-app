'use client'

import { useState } from 'react'
import { Heading } from '@/components/heading'
import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { Badge } from '@/components/badge'
import type { Task } from './tasks-data'
import { initialTasks } from './tasks-data'

const statuses = ['Backlog', 'Todo', 'In progress', 'Done']

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

export default function TasksBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  function toggleComplete(id: number) {
    setTasks((items) =>
      items.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <Heading>Tasks</Heading>
        <Button className="-my-0.5">Add task</Button>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statuses.map((status) => (
          <div key={status} className="space-y-4">
            <h3 className="font-semibold text-sm/6 text-zinc-700 dark:text-zinc-200">
              {status}
            </h3>
            {tasks
              .filter((t) => t.status === status)
              .map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border border-zinc-200 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-zinc-900"
                >
                  <div className="flex items-start gap-2">
                    <Checkbox
                      name={`task-${task.id}`}
                      checked={task.completed}
                      onChange={() => toggleComplete(task.id)}
                    />
                    <span
                      className={task.completed ? 'line-through text-zinc-500' : ''}
                    >
                      {task.title}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <Badge>{task.label}</Badge>
                    <Badge color={priorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  )
}
