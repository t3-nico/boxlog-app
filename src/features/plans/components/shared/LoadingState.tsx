'use client'

import { Skeleton } from '@/components/ui/skeleton'

interface LoadingStateProps {
  count?: number
  type?: 'card' | 'list' | 'form'
}

function CardSkeleton() {
  return (
    <div className="border-border bg-card space-y-3 rounded-xl border p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="h-4 w-full" />
    </div>
  )
}

function ListItemSkeleton() {
  return (
    <div className="border-border bg-card flex items-center justify-between rounded-xl border p-3">
      <div className="flex flex-1 items-center gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  )
}

export function LoadingState({ count = 3, type = 'card' }: LoadingStateProps) {
  const SkeletonComponent = {
    card: CardSkeleton,
    list: ListItemSkeleton,
    form: FormSkeleton,
  }[type]

  if (type === 'form') {
    return <FormSkeleton />
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  )
}
