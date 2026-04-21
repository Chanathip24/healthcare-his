import { type ReactNode, useMemo } from 'react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/common'
import type { ICompVariantConfig, ITooptipWithIconVariants, Maybe } from '@/type'
import { tv } from '@/utilities'

type ITooltipWithIcon = {
  icon: ReactNode
  value: Maybe<string>
  variant?: ITooptipWithIconVariants['variant']
}

const tooltipVariant: ICompVariantConfig<ITooptipWithIconVariants> = tv({
  base: 'border border-page bg-popover text-primary',
  variants: {
    variant: {
      default: '',
      destructive: 'border-theme-destructive bg-theme-destructive text-theme-white',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
const TooltipWithIcon = ({ icon, value = '', variant }: ITooltipWithIcon) => {
  const tooltipClassname: string = useMemo<string>((): string => tooltipVariant({ variant }), [variant])
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{icon}</TooltipTrigger>
        <TooltipContent side="top" className={tooltipClassname}>
          <p>{value}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { TooltipWithIcon }
