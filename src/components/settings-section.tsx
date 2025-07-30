'use client'

import clsx from 'clsx'
import { Subheading } from './heading'
import { Text } from './text'
import { Switch } from './switch'
import { 
  Select,
  SelectContent,
  SelectItem as ShadcnSelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
      <div className="divide-y divide-border rounded-lg border border-border">
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
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
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
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="w-40">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {children}
          </SelectContent>
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
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
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
