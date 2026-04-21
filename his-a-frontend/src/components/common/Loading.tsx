import { useMemo } from 'react'

import type { ICompVariantConfig, ILoadingProps, ILoadingVariants } from '@/type'
import { cn, tv } from '@/utilities'

import { Spinner } from './Spinner'

const loadingVariants: ICompVariantConfig<ILoadingVariants> = tv({
  base: 'flex flex-col items-center justify-center gap-y-8',
  variants: {
    variant: {
      page: 'fixed inset-0 z-50 h-dvh w-full bg-page',
      section: 'w-full py-16',
      inline: 'flex-row gap-2 py-2',
      overlay: 'absolute inset-0 z-40 bg-page/80 backdrop-blur-sm',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  defaultVariants: {
    variant: 'page',
    size: 'md',
  },
})

const Loading = ({ variant = 'page', message, className }: ILoadingProps) => {
  const containerClassName: string = useMemo((): string => {
    return loadingVariants({ variant, className })
  }, [variant, className])

  return (
    <div className={containerClassName}>
      <Spinner className="text-theme-primary" />
      {message && (
        <p className={cn('text-theme-gray-400', variant === 'inline' ? 'text-body-3' : 'text-body-2')}>{message}</p>
      )}
    </div>
  )
}

export { type ILoadingProps, Loading }
