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
          className={cn(change.startsWith('+') ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700')}
        >
          {change}
        </Badge>{' '}
        <span className="text-muted-foreground">from last week</span>
      </div>
    </div>
  )
}
