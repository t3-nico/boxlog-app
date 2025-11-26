import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export const Stat = ({ title, value, change }: { title: string; value: string; change: string }) => {
  return (
    <div>
      <Separator />
      <div className="mt-6 text-base font-medium">{title}</div>
      <div className="mt-3 text-3xl font-semibold">{value}</div>
      <div className="mt-3 text-sm">
        <Badge
          className={cn(
            // M3 State Layer: セマンティックカラー使用（+はprimary、-はdestructive）
            change.startsWith('+')
              ? 'bg-primary text-primary-foreground hover:bg-primary/92'
              : 'bg-destructive text-destructive-foreground hover:bg-destructive/92'
          )}
        >
          {change}
        </Badge>{' '}
        <span className="text-muted-foreground">from last week</span>
      </div>
    </div>
  )
}
