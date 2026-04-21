import { useMemo } from 'react'

import type { ICompVariantConfig, ISkeletonProps, ISkeletonVariants } from '@/type'
import { tv } from '@/utilities'

const skeletonVariants: ICompVariantConfig<ISkeletonVariants> = tv({
  base: 'w-full shrink-0 animate-pulse rounded-md',
  variants: {
    variant: {
      default: 'bg-theme-night-50/15',
    },
    size: {
      default: 'h-6',
      md: 'h-11',
      sm: 'h-8',
      fit: 'size-auto',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

const Skeleton = ({ size = 'default', variant = 'default', className }: ISkeletonProps) => {
  const skeletonClassName: string = useMemo((): string => {
    return skeletonVariants({
      variant,
      size,
      className,
    })
  }, [size, variant, className])

  return <div className={skeletonClassName} />
}

export { type ISkeletonProps, Skeleton }
