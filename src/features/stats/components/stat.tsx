import { Badge } from '@/components/shadcn-ui/badge'
import { Separator } from '@/components/shadcn-ui/separator'
import { typography, colors } from '@/config/theme'

export const Stat = ({ title, value, change }: { title: string; value: string; change: string }) => {
  return (
    <div>
      <Separator />
      <div className={`mt-6 ${typography.heading.h6} font-medium`}>{title}</div>
      <div className={`mt-3 ${typography.heading.h2} font-semibold`}>{value}</div>
      <div className={`mt-3 ${typography.body.small}`}>
        <Badge className={change.startsWith('+') ? colors.semantic.success.DEFAULT : colors.semantic.error.DEFAULT}>{change}</Badge>{' '}
        <span className={colors.text.muted}>from last week</span>
      </div>
    </div>
  )
}
