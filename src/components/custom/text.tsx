import clsx from 'clsx'

import { Link } from './link'
import { colors, typography, spacing, rounded } from '@/config/theme'

export function Text({ className, ...props }: React.ComponentPropsWithoutRef<'p'>) {
  return (
    <p
      data-slot="text"
      {...props}
      className={clsx(className, `${typography.body.large} ${colors.text.secondary} sm:${typography.body.small}`)}
    />
  )
}

export function TextLink({ className, ...props }: React.ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      {...props}
      className={clsx(
        className,
        `${colors.text.primary} underline decoration-current/50 data-hover:decoration-current`
      )}
    />
  )
}

export function Strong({ className, ...props }: React.ComponentPropsWithoutRef<'strong'>) {
  return <strong {...props} className={clsx(className, `font-medium ${colors.text.primary}`)} />
}

export function Code({ className, ...props }: React.ComponentPropsWithoutRef<'code'>) {
  return (
    <code
      {...props}
      className={clsx(
        className,
        `${rounded.component.input.checkbox} border ${colors.border.DEFAULT} ${colors.background.subtle} ${spacing.padding.xs} ${typography.body.small} font-medium ${colors.text.primary} sm:text-[0.8125rem]`
      )}
    />
  )
}
