'use client'

import { useState } from 'react'

import { AlertTriangleIcon, CheckIcon, CloudIcon, SmartphoneIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import type { ConflictResolution } from '../types'

export interface ConflictContext {
  actionId: string
  entity: string
  localData: unknown
  serverData: unknown
  localTimestamp: Date
  serverTimestamp: Date
  conflicts: unknown[]
}

interface ConflictResolutionModalProps {
  isOpen: boolean
  conflict: ConflictContext
  onResolve: (resolution: ConflictResolution) => Promise<void>
  onCancel: () => void
}

type ResolutionChoice = 'local' | 'server'

export function ConflictResolutionModal({ isOpen, conflict, onResolve, onCancel }: ConflictResolutionModalProps) {
  const t = useTranslations()
  const [selectedChoice, setSelectedChoice] = useState<ResolutionChoice | null>(null)
  const [isResolving, setIsResolving] = useState(false)

  const handleResolve = async () => {
    if (!selectedChoice) return

    setIsResolving(true)
    try {
      await onResolve({ choice: selectedChoice })
    } finally {
      setIsResolving(false)
    }
  }

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const formatData = (data: unknown): string => {
    if (data === null || data === undefined) {
      return '-'
    }
    if (typeof data === 'object') {
      const obj = data as Record<string, unknown>
      if ('title' in obj && typeof obj.title === 'string') {
        return obj.title
      }
      if ('name' in obj && typeof obj.name === 'string') {
        return obj.name
      }
      return JSON.stringify(data, null, 2)
    }
    return String(data)
  }

  const getEntityLabel = (entity: string): string => {
    switch (entity) {
      case 'plans':
        return t('offline.entity.plans')
      case 'tags':
        return t('offline.entity.tags')
      case 'tag_groups':
        return t('offline.entity.tagGroups')
      default:
        return entity
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="size-5 text-warning" />
            {t('offline.conflict.title')}
          </DialogTitle>
          <DialogDescription>{t('offline.conflict.description', { entity: getEntityLabel(conflict.entity) })}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Local Version */}
          <button
            type="button"
            className={cn(
              'w-full rounded-lg border p-4 text-left transition-colors',
              selectedChoice === 'local'
                ? 'border-primary bg-primary/5 ring-2 ring-primary'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            )}
            onClick={() => setSelectedChoice('local')}
          >
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <SmartphoneIcon className="size-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t('offline.conflict.localVersion')}</span>
                  {selectedChoice === 'local' && <CheckIcon className="size-4 text-primary" />}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t('offline.conflict.localDescription')}</p>
                <div className="mt-2 rounded bg-muted/50 p-2">
                  <p className="truncate text-sm font-mono">{formatData(conflict.localData)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatTimestamp(conflict.localTimestamp)}</p>
                </div>
              </div>
            </div>
          </button>

          {/* Server Version */}
          <button
            type="button"
            className={cn(
              'w-full rounded-lg border p-4 text-left transition-colors',
              selectedChoice === 'server'
                ? 'border-primary bg-primary/5 ring-2 ring-primary'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            )}
            onClick={() => setSelectedChoice('server')}
          >
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <CloudIcon className="size-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t('offline.conflict.serverVersion')}</span>
                  {selectedChoice === 'server' && <CheckIcon className="size-4 text-primary" />}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t('offline.conflict.serverDescription')}</p>
                <div className="mt-2 rounded bg-muted/50 p-2">
                  <p className="truncate text-sm font-mono">{formatData(conflict.serverData)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatTimestamp(conflict.serverTimestamp)}</p>
                </div>
              </div>
            </div>
          </button>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isResolving}>
            {t('actions.cancel')}
          </Button>
          <Button type="button" onClick={handleResolve} disabled={!selectedChoice || isResolving}>
            {isResolving ? t('offline.conflict.resolving') : t('offline.conflict.resolve')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
