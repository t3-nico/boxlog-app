import * as React from "react"

import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { secondary, semantic } from "@/config/theme/colors"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white shadow-sm hover:bg-blue-700',
        destructive: cn(semantic.error.DEFAULT, 'text-white shadow-sm hover:bg-red-700 dark:hover:bg-red-600 focus-visible:ring-red-500'),
        outline: 'border border-neutral-200 bg-white shadow-sm hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:bg-neutral-800',
        secondary: cn(secondary.DEFAULT, secondary.text, secondary.hover),
        ghost: 'hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800',
        link: 'text-blue-600 underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9'
      },
      loading: {
        true: 'cursor-wait'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean
    }
>(({ className, variant, size, asChild = false, type = "button", ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      type={type}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
