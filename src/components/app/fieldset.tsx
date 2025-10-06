import type React from 'react'

import * as Headless from '@headlessui/react'
import clsx from 'clsx'

import { cn } from '@/lib/utils'

export const Fieldset = ({
  className,
  ...props
}: { className?: string } & Omit<Headless.FieldsetProps, 'as' | 'className'>) => {
  return (
    <Headless.Fieldset
      {...props}
      className={clsx(className, '*:data-[slot=text]:mt-1 [&>*+[data-slot=control]]:mt-6')}
    />
  )
}

export const Legend = ({
  className,
  ...props
}: { className?: string } & Omit<Headless.LegendProps, 'as' | 'className'>) => {
  return (
    <Headless.Legend
      data-slot="legend"
      {...props}
      className={cn(
        className,
        'text-base font-semibold text-neutral-900 dark:text-neutral-100 data-disabled:opacity-50 sm:text-sm'
      )}
    />
  )
}

export const FieldGroup = ({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) => {
  return <div data-slot="control" {...props} className={cn(className, 'flex flex-col gap-8')} />
}

export const Field = ({ className, ...props }: { className?: string } & Omit<Headless.FieldProps, 'as' | 'className'>) => {
  return (
    <Headless.Field
      {...props}
      className={clsx(
        className,
        '[&>[data-slot=label]+[data-slot=control]]:mt-3',
        '[&>[data-slot=label]+[data-slot=description]]:mt-1',
        '[&>[data-slot=description]+[data-slot=control]]:mt-3',
        '[&>[data-slot=control]+[data-slot=description]]:mt-3',
        '[&>[data-slot=control]+[data-slot=error]]:mt-3',
        '*:data-[slot=label]:font-medium'
      )}
    />
  )
}

export const Label = ({ className, ...props }: { className?: string } & Omit<Headless.LabelProps, 'as' | 'className'>) => {
  return (
    <Headless.Label
      data-slot="label"
      {...props}
      className={cn(
        className,
        'text-base text-neutral-900 dark:text-neutral-100 select-none data-disabled:opacity-50 sm:text-sm'
      )}
    />
  )
}

export const Description = ({
  className,
  ...props
}: { className?: string } & Omit<Headless.DescriptionProps, 'as' | 'className'>) => {
  return (
    <Headless.Description
      data-slot="description"
      {...props}
      className={cn(className, 'text-base text-neutral-800 dark:text-neutral-200 data-disabled:opacity-50 sm:text-sm')}
    />
  )
}

export const ErrorMessage = ({
  className,
  ...props
}: { className?: string } & Omit<Headless.DescriptionProps, 'as' | 'className'>) => {
  return (
    <Headless.Description
      data-slot="error"
      {...props}
      className={cn(className, 'text-base text-red-600 dark:text-red-400 data-disabled:opacity-50 sm:text-sm')}
    />
  )
}
