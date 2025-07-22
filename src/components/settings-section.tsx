'use client'

import clsx from 'clsx'
import { Subheading } from './heading'
import { Text } from './text'
import { Switch } from './switch'
import { Select } from './select'
import { Input } from './input'

export function SettingSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={clsx('space-y-4', className)}>
      <div className="space-y-1">
        <Subheading>{title}</Subheading>
        {description && <Text>{description}</Text>}
      </div>
      <div className="divide-y divide-zinc-950/5 rounded-lg border border-zinc-950/5 dark:divide-white/10 dark:border-white/10">
        {children}
      </div>
    </section>
  )
}

export function ToggleItem({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description?: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-950 dark:text-white">{label}</p>
        {description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        )}
      </div>
      <Switch checked={value} onChange={onChange} />
    </div>
  )
}

export function SelectItem({
  label,
  description,
  value,
  onChange,
  children,
}: {
  label: string
  description?: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-950 dark:text-white">{label}</p>
        {description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        )}
      </div>
      <div className="w-40">
        <Select value={value} onChange={onChange} className="w-full">
          {children}
        </Select>
      </div>
    </div>
  )
}

export function DatePickerItem({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description?: string
  value: string | null
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-950 dark:text-white">{label}</p>
        {description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        )}
      </div>
      <div className="w-40">
        <Input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  )
}
