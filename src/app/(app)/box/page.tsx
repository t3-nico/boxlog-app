import { Heading } from '@/components/heading'
import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { Badge } from '@/components/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tasks',
}

const tasks = [
  { id: 1, title: 'Set up project repository', label: 'Project', completed: false },
  { id: 2, title: 'Design application UI', label: 'Design', completed: true },
  { id: 3, title: 'Implement authentication', label: 'Development', completed: false },
  { id: 4, title: 'Write unit tests', label: 'QA', completed: false },
]

export default async function TasksPage() {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Heading>Tasks</Heading>
        <Button>Add task</Button>
      </div>
      <ul className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-4 p-4">
            <Checkbox defaultChecked={task.completed} />
            <div className="flex-1">
              <label className="font-medium" htmlFor={`task-${task.id}`}>{task.title}</label>
              <div className="text-xs text-zinc-500">{task.label}</div>
            </div>
            <Badge color={task.completed ? 'lime' : 'zinc'}>
              {task.completed ? 'Done' : 'Todo'}
            </Badge>
          </li>
        ))}
      </ul>
    </>
  )
}
