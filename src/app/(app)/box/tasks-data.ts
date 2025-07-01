export interface Task {
  id: number
  title: string
  status: string
  label: string
  priority: string
  completed?: boolean
}

export const initialTasks: Task[] = [
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
