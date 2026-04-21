import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import type { VariantProps } from 'tailwind-variants'

import type { IButtonVariants, ICompVariantConfig } from '@/type'
import { cn, tv } from '@/utilities'

const buttonVariants: ICompVariantConfig<IButtonVariants> = tv({
  base: "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-clip-padding text-body-2 font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-page focus-visible:ring-3 focus-visible:ring-theme-primary/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-theme-destructive aria-invalid:ring-3 aria-invalid:ring-theme-destructive/20 dark:aria-invalid:border-theme-destructive/50 dark:aria-invalid:ring-theme-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  variants: {
    variant: {
      default: '[a]:hover:bg-primary/80 bg-theme-primary text-theme-white',
      outline:
        'border-page bg-page hover:bg-theme-gray-700/70 hover:text-theme-white aria-expanded:bg-theme-gray aria-expanded:text-theme-white dark:aria-expanded:bg-theme-gray',
      secondary:
        'aria-expanded:text-theme-secondary-foreground bg-theme-secondary text-secondary hover:bg-theme-secondary/80 aria-expanded:bg-theme-secondary dark:hover:bg-theme-gray dark:aria-expanded:text-theme-white',
      ghost:
        'hover:bg-theme-primary/10 hover:text-theme-primary aria-expanded:bg-theme-gray aria-expanded:text-theme-white dark:aria-expanded:bg-theme-gray',
      destructive:
        'bg-theme-destructive/10 text-theme-destructive hover:bg-theme-destructive/20 focus-visible:border-theme-destructive/40 focus-visible:ring-theme-destructive/20 dark:bg-theme-destructive/20 dark:hover:bg-theme-destructive/30 dark:focus-visible:ring-theme-destructive/40',
      link: 'text-theme-white underline-offset-4 hover:underline',
    },
    size: {
      default: 'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
      xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-body-3 in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
      sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
      lg: 'h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
      icon: 'size-8',
      'icon-xs':
        "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
      'icon-sm': 'size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg',
      'icon-lg': 'size-9',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button }
