'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Clipboard,
  Tag,
  Folder,
  Calendar,
  FileText
} from 'lucide-react'

type AddType = 'task' | 'tag' | 'smart-folder' | 'event' | 'note'

interface AddOption {
  type: AddType
  title: string
  description: string
  icon: React.ReactNode
  color: string
  href: string
}

const addOptions: AddOption[] = [
  {
    type: 'task',
    title: 'New Task',
    description: 'Create a new task with details, tags, and priority',
    icon: <Clipboard className="h-8 w-8" />,
    color: 'bg-blue-500',
    href: '/add/task'
  },
  {
    type: 'tag',
    title: 'New Tag',
    description: 'Create a new tag to organize your tasks',
    icon: <Tag className="h-8 w-8" data-slot="icon" />,
    color: 'bg-green-500',
    href: '/add/tag'
  },
  {
    type: 'smart-folder',
    title: 'New Smart Folder',
    description: 'Create a smart folder with automatic filtering conditions',
    icon: <Folder className="h-8 w-8" />,
    color: 'bg-purple-500',
    href: '/add/smart-folder'
  },
  {
    type: 'event',
    title: 'New Event',
    description: 'Schedule a new calendar event or meeting',
    icon: <Calendar className="h-8 w-8" data-slot="icon" />,
    color: 'bg-orange-500',
    href: '/add/event'
  },
  {
    type: 'note',
    title: 'New Note',
    description: 'Write a quick note or documentation',
    icon: <FileText className="h-8 w-8" />,
    color: 'bg-gray-500',
    href: '/add/note'
  }
]

export default function AddPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<AddType | null>(null)

  const handleOptionClick = (option: AddOption) => {
    setSelectedType(option.type)
    router.push(option.href)
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Add New</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Choose what you&apos;d like to create
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addOptions.map((option) => (
          <div
            key={option.type}
            className={`group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
              selectedType === option.type ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleOptionClick(option)}
          >
            <div className="flex items-start space-x-4">
              <div className={`${option.color} p-3 rounded-lg text-white`}>
                {option.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {option.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {option.description}
                </p>
              </div>
            </div>
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Quick Tips
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Use <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl+N</kbd> to quickly create a new task</li>
          <li>• Tags help organize tasks by category or project</li>
          <li>• Smart folders automatically filter tasks based on your conditions</li>
          <li>• Events sync with your calendar workflow</li>
        </ul>
      </div>
    </div>
  )
}