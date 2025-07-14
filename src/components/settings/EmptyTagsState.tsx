'use client'

import { Tag as TagIcon } from 'lucide-react'
import { Plus as PlusIcon } from 'lucide-react'
import { Button } from '@/components/button'

interface EmptyTagsStateProps {
  onCreateClick: () => void
}

export const EmptyTagsState = ({ onCreateClick }: EmptyTagsStateProps) => {
  return (
    <div className="text-center py-12">
      <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
        No tags yet
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Create your first tag to start organizing your content
      </p>
      <div className="mt-6">
        <Button onClick={onCreateClick}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Create your first tag
        </Button>
      </div>
    </div>
  )
}