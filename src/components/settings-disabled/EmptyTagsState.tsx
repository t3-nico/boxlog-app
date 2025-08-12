'use client'

import { Tag as TagIcon } from 'lucide-react'
import { Plus as PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyTagsStateProps {
  onCreateClick: () => void
}

export const EmptyTagsState = ({ onCreateClick }: EmptyTagsStateProps) => {
  return (
    <div className="text-center py-12">
      <TagIcon className="mx-auto h-12 w-12 text-gray-400" data-slot="icon" />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
        No tags yet
      </h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Create your first tag to start organizing your content
      </p>
      <div className="mt-6">
        <Button onClick={onCreateClick}>
          <PlusIcon className="w-4 h-4 mr-2" data-slot="icon" />
          Create your first tag
        </Button>
      </div>
    </div>
  )
}