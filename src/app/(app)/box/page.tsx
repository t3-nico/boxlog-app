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
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tasks',
}

const tasks = [
  {
    id: 1,
    title: 'Set up project repository',
    status: 'Backlog',
    label: 'Project',
    priority: 'Low',
  },
  {
    id: 2,
    title: 'Design application UI',
    status: 'In progress',
    label: 'Design',
    priority: 'High',
  },
  {
    id: 3,
    title: 'Implement authentication',
    status: 'Todo',
    label: 'Development',
    priority: 'Medium',
  },
  {
    id: 4,
    title: 'Write unit tests',
    status: 'Todo',
    label: 'QA',
    priority: 'Low',
  },
]

export default async function TasksPage() {
  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <Heading>Tasks</Heading>
        <Button className="-my-0.5">Add task</Button>
      </div>
      <Table className="mt-8 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader className="w-12" />
            <TableHeader>Task</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Label</TableHeader>
            <TableHeader className="text-right">Priority</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <Checkbox name={`task-${task.id}`} />
              </TableCell>
              <TableCell>{task.title}</TableCell>
              <TableCell>
                <Badge color={task.status === 'Done' ? 'lime' : task.status === 'In progress' ? 'blue' : 'zinc'}>
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge>{task.label}</Badge>
              </TableCell>
              <TableCell className="text-right">{task.priority}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
