'use client'

import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="border-border bg-card flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-12 text-center">
      {icon && <div className="text-muted-foreground">{icon}</div>}

      <div className="space-y-2">
        <h3 className="text-foreground text-lg font-semibold">{title}</h3>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>

      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  )
}
