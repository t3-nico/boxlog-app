import { Task, TaskType, TaskStatus, TaskPriority } from '@/types/box'

export const taskTypes: TaskType[] = ['Bug', 'Feature', 'Documentation']

export const initialTasks: Task[] = [
  {
    id: '1',
    task: 'TASK-8782',
    title: "You can't compress the program without quantifying the open-source SSD pixel!",
    type: 'Documentation',
    status: 'In Progress',
    priority: 'Medium',
    selected: false,
    description: 'This task involves implementing a compression algorithm for the SSD pixel quantification system.',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    dueDate: new Date('2024-02-15'),
    estimatedHours: 8,
    actualHours: 6,
    tags: ['tag-6', 'tag-2-1'], // Documentation, Backend/API
    attachments: [],
    comments: [
      {
        id: 'c1',
        content: 'Started working on the initial implementation',
        createdAt: new Date('2024-01-16'),
        author: 'John Doe'
      }
    ],
  },
  {
    id: '2',
    task: 'TASK-7878',
    title: 'Try to calculate the EXE feed, maybe it will index the multi-byte pixel!',
    type: 'Documentation',
    status: 'Backlog',
    priority: 'Medium',
    selected: false,
    description: 'Calculate and index the multi-byte pixel for EXE feed optimization.',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
    dueDate: new Date('2024-02-20'),
    estimatedHours: 4,
    tags: ['tag-2', 'tag-2-1-1'], // Backend, Backend/API/REST
    attachments: [],
    comments: [],
  },
  {
    id: '3',
    task: 'TASK-7839',
    title: 'We need to bypass the neural TCP card!',
    type: 'Bug',
    status: 'Todo',
    priority: 'High',
    selected: false,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-18'),
    tags: ['tag-2', 'tag-5'], // Backend, Testing
    attachments: [],
    comments: [],
  },
  {
    id: '4',
    task: 'TASK-5562',
    title: 'The SAS interface is down, bypass the open-source pixel so we can back up the PNG bandwidth!',
    type: 'Feature',
    status: 'Backlog',
    priority: 'Medium',
    selected: false,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-14'),
    tags: ['tag-1-1', 'tag-1-1-1'], // Frontend/Components, Frontend/Components/Button
    attachments: [],
    comments: [],
  },
  {
    id: '5',
    task: 'TASK-8686',
    title: "I'll parse the wireless SSL protocol, that should driver the API panel!",
    type: 'Feature',
    status: 'Cancelled',
    priority: 'Medium',
    selected: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-22'),
    tags: ['tag-2-1'], // Backend/API
    attachments: [],
    comments: [],
  },
  // Additional tasks with minimal required fields
  {
    id: '6',
    task: 'TASK-1280',
    title: 'Use the digital TLS panel, then you can transmit the haptic system!',
    type: 'Bug',
    status: 'Done',
    priority: 'High',
    selected: false,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-25'),
    tags: ['tag-2', 'tag-5'], // Backend, Testing
    attachments: [],
    comments: [],
  },
  {
    id: '7',
    task: 'TASK-7262',
    title: 'The UTF8 application is down, parse the neural bandwidth so we can back up the PNG firewall!',
    type: 'Feature',
    status: 'Done',
    priority: 'High',
    selected: false,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-24'),
    tags: ['tag-1', 'tag-2'], // Frontend, Backend
    attachments: [],
    comments: [],
  },
  {
    id: '8',
    task: 'TASK-1138',
    title: 'Generating the driver won\'t do anything, we need to quantify the 1080p SMTP bandwidth!',
    type: 'Feature',
    status: 'In Progress',
    priority: 'Medium',
    selected: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-23'),
    tags: ['tag-1-2', 'tag-1-2-1'], // Frontend/Styling, Frontend/Styling/Responsive
    attachments: [],
    comments: [],
  },
]

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'Todo':
      return 'text-gray-500 bg-gray-100'
    case 'In Progress':
      return 'text-blue-500 bg-blue-100'
    case 'Done':
      return 'text-green-500 bg-green-100'
    case 'Cancelled':
      return 'text-red-500 bg-red-100'
    case 'Backlog':
      return 'text-gray-400 bg-gray-50'
    default:
      return 'text-gray-500 bg-gray-100'
  }
}

export function getPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case 'Low':
      return 'text-gray-500 bg-gray-100'
    case 'Medium':
      return 'text-yellow-500 bg-yellow-100'
    case 'High':
      return 'text-red-500 bg-red-100'
    default:
      return 'text-gray-500 bg-gray-100'
  }
}

export function getTypeColor(type: TaskType): string {
  switch (type) {
    case 'Bug':
      return 'text-red-700 bg-red-100'
    case 'Feature':
      return 'text-blue-700 bg-blue-100'
    case 'Documentation':
      return 'text-green-700 bg-green-100'
    default:
      return 'text-gray-700 bg-gray-100'
  }
}