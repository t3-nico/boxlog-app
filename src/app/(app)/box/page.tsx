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

export default async function TasksPage() {
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
              <TableCell className="text-right">
                <Badge color={priorityColor(task.priority)}>{task.priority}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
