import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import type { VariantProps } from 'tailwind-variants'

import type { IBadgesVarints, ICompVariantConfig } from '@/type'
import { cn, tv } from '@/utilities'

const badgeVariants: ICompVariantConfig<IBadgesVarints> = tv({
  base: 'focus:ring-ring inline-flex items-center rounded-md border px-2.5 py-1 text-body-4! font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none',
  variants: {
    variant: {
      default: 'border-transparent bg-theme-primary/20 text-theme-primary hover:bg-theme-primary/40',
      secondary: 'border-transparent bg-theme-secondary/20 text-theme-secondary hover:bg-theme-secondary/40',
      destructive: 'border-transparent bg-theme-destructive/20 text-theme-destructive hover:bg-theme-destructive/40',
      outline: 'border-page text-theme-gray-400',
      success: 'border-transparent bg-theme-success-200/80 text-theme-success-900 hover:bg-theme-success-300/80',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp data-slot="badge" data-variant={variant} className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge }
