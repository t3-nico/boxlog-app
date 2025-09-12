import clsx from 'clsx'

import { colors, typography, spacing, rounded } from '@/config/theme'

import { Link } from './link'

export const Text = ({ className, ...props }: React.ComponentPropsWithoutRef<'p'>) => {
  return (
    <p
      data-slot="text"
      {...props}
      className={clsx(className, `${typography.body.large} ${colors.text.secondary} sm:${typography.body.small}`)}
    />
  )
}

export const TextLink = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof Link>) => {
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

export const Strong = ({ className, ...props }: React.ComponentPropsWithoutRef<'strong'>) => {
  return <strong {...props} className={clsx(className, `font-medium ${colors.text.primary}`)} />
}

export const Code = ({ className, ...props }: React.ComponentPropsWithoutRef<'code'>) => {
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
