'use client'

import { Fragment } from 'react'

import * as Headless from '@headlessui/react'
import clsx from 'clsx'

import { cn } from '@/lib/utils'

export const Listbox = <T,>({
  className,
  placeholder,
  'aria-label': ariaLabel,
  children: options,
  ...props
}: {
  className?: string
  placeholder?: React.ReactNode
  'aria-label'?: string
  children?: React.ReactNode
} & Omit<Headless.ListboxProps<typeof Fragment, T>, 'as' | 'multiple'>) => {
  return (
    <Headless.Listbox {...props} multiple={false}>
      <Headless.ListboxButton
        data-slot="control"
        aria-label={ariaLabel}
        className={clsx([
          className,
          // Basic layout
          'group relative block w-full',
          // Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
          'before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white before:shadow-sm',
          // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
          'dark:before:hidden',
          // Hide default focus styles
          'focus:outline-hidden',
          // Focus ring
          'data-focus:after:ring-2 data-focus:after:ring-blue-500 after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:ring-transparent',
          // Disabled state
          'data-disabled:opacity-50 data-disabled:before:bg-zinc-950/5 data-disabled:before:shadow-none',
        ])}
      >
        <Headless.ListboxSelectedOption
          as="span"
          options={options}
          placeholder={placeholder ? <span className="block truncate text-neutral-600 dark:text-neutral-400">{placeholder}</span> : null}
          className={clsx([
            // Basic layout
            'relative block w-full appearance-none rounded-lg py-[calc(--spacing(2.5)-1px)] sm:py-[calc(--spacing(1.5)-1px)]',
            // Set minimum height for when no value is selected
            'min-h-12 sm:min-h-10',
            // Horizontal padding
            'pl-[calc(--spacing(3.5)-1px)] pr-[calc(--spacing(7)-1px)] sm:pl-[calc(--spacing(3)-1px)]',
            // Typography
            'text-left text-base/6 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-800 placeholder:dark:text-neutral-200 sm:text-sm/6 forced-colors:text-[CanvasText]',
            // Border
            'group-data-active:border-zinc-950/20 group-data-hover:border-zinc-950/20 dark:group-data-active:border-white/20 dark:group-data-hover:border-white/20 border border-zinc-950/10 dark:border-white/10',
            // Background color
            'bg-transparent dark:bg-white/5',
            // Invalid state
            'group-data-invalid:border-red-500 group-data-hover:group-data-invalid:border-red-500 dark:group-data-invalid:border-red-600 dark:data-hover:group-data-invalid:border-red-600',
            // Disabled state
            'group-data-disabled:border-zinc-950/20 group-data-disabled:opacity-100 dark:group-data-disabled:border-white/15 dark:group-data-disabled:bg-white/2.5 dark:group-data-disabled:data-hover:border-white/15',
          ])}
        />
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg
            className="group-data-disabled:stroke-zinc-600 size-5 stroke-zinc-500 sm:size-4 dark:stroke-zinc-400 forced-colors:stroke-[CanvasText]"
            viewBox="0 0 16 16"
            aria-hidden="true"
            fill="none"
          >
            <path d="M5.75 10.75L8 13L10.25 10.75" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.25 5.25L8 3L5.75 5.25" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Headless.ListboxButton>
      <Headless.ListboxOptions
        transition
        anchor="selection start"
        className={clsx(
          // Anchor positioning
          '[--anchor-offset:-1.625rem] [--anchor-padding:--spacing(4)] sm:[--anchor-offset:-1.375rem]',
          // Base styles
          'isolate w-max min-w-[calc(var(--button-width)+1.75rem)] select-none scroll-py-1 rounded-xl p-1',
          // Invisible border that is only visible in `forced-colors` mode for accessibility purposes
          'focus:outline-hidden outline outline-transparent',
          // Handle scrolling when menu won't fit in viewport
          'overflow-y-scroll overscroll-contain',
          // Popover background
          'bg-white/75 backdrop-blur-xl dark:bg-zinc-800/75',
          // Shadows
          'shadow-lg ring-1 ring-zinc-950/10 dark:ring-inset dark:ring-white/10',
          // Transitions
          'data-closed:data-leave:opacity-0 data-transition:pointer-events-none transition-opacity duration-100 ease-in'
        )}
      >
        {options}
      </Headless.ListboxOptions>
    </Headless.Listbox>
  )
}

export const ListboxOption = <T,>({
  children,
  className,
  ...props
}: { className?: string; children?: React.ReactNode } & Omit<
  Headless.ListboxOptionProps<'div', T>,
  'as' | 'className'
>) => {
  const sharedClasses = clsx(
    // Base
    'flex min-w-0 items-center',
    // Icons
    '*:data-[slot=icon]:size-5 *:data-[slot=icon]:shrink-0 sm:*:data-[slot=icon]:size-4',
    '*:data-[slot=icon]:text-neutral-800 *:data-[slot=icon]:dark:text-neutral-200 group-data-focus/option:*:data-[slot=icon]:text-white',
    'forced-colors:group-data-focus/option:*:data-[slot=icon]:text-[Canvas] forced-colors:*:data-[slot=icon]:text-[CanvasText]',
    // Avatars
    '*:data-[slot=avatar]:-mx-1 *:data-[slot=avatar]:size-6 sm:*:data-[slot=avatar]:size-5'
  )

  return (
    <Headless.ListboxOption as={Fragment} {...props}>
      {({ selectedOption }) => {
        if (selectedOption) {
          return <div className={clsx(className, sharedClasses)}>{children}</div>
        }

        return (
          <div
            className={clsx(
              // Basic layout
              'group/option grid cursor-default grid-cols-[--spacing(5)_1fr] items-baseline gap-x-2 rounded-lg py-3 pl-2 pr-3.5 sm:grid-cols-[--spacing(4)_1fr] sm:py-2 sm:pl-2 sm:pr-3',
              // Typography
              'text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white forced-colors:text-[CanvasText]',
              // Focus
              'outline-hidden data-focus:bg-blue-500 data-focus:text-white',
              // Forced colors mode
              'forced-colors:data-focus:bg-[Highlight] forced-colors:data-focus:text-[HighlightText] forced-color-adjust-none',
              // Disabled
              'data-disabled:opacity-50'
            )}
          >
            <svg
              className="group-data-selected/option:inline relative hidden size-5 self-center stroke-current sm:size-4"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path d="M4 8.5l3 3L12 4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={clsx(className, sharedClasses, 'col-start-2')}>{children}</span>
          </div>
        )
      }}
    </Headless.ListboxOption>
  )
}

export const ListboxLabel = ({ className, ...props }: React.ComponentPropsWithoutRef<'span'>) => {
  return <span {...props} className={clsx(className, 'ml-3 truncate first:ml-0 sm:ml-2 sm:first:ml-0')} />
}

export const ListboxDescription = ({ className, children, ...props }: React.ComponentPropsWithoutRef<'span'>) => {
  return (
    <span
      {...props}
      className={cn(
        className,
        'flex flex-1 overflow-hidden text-neutral-800 dark:text-neutral-200 group-data-focus/option:text-white before:w-2 before:min-w-0 before:shrink'
      )}
    >
      <span className="flex-1 truncate">{children}</span>
    </span>
  )
}
