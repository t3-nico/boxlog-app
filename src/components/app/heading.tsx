import { cn } from '@/lib/utils'

type HeadingProps = { level?: 1 | 2 | 3 | 4 | 5 | 6 } & React.ComponentPropsWithoutRef<
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
>

export const Heading = ({ className, level = 1, ...props }: HeadingProps) => {
  const Element: `h${typeof level}` = `h${level}`

  const getHeadingClass = (level: number) => {
    switch (level) {
      case 1:
        return 'text-heading-h1'
      case 2:
        return 'text-heading-h2'
      case 3:
        return 'text-heading-h3'
      case 4:
        return 'text-heading-h4'
      case 5:
        return 'text-heading-h5'
      case 6:
        return 'text-heading-h6'
      default:
        return 'text-heading-h1'
    }
  }

  return <Element {...props} className={cn(className, getHeadingClass(level), 'text-foreground')} />
}

export const Subheading = ({ className, level = 2, ...props }: HeadingProps) => {
  const Element: `h${typeof level}` = `h${level}`

  return <Element {...props} className={cn(className, 'text-foreground text-base font-semibold sm:text-sm')} />
}
