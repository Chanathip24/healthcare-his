type ISkeletonVariants = {
  variant: 'default'
  size: 'default' | 'md' | 'sm' | 'fit'
}

interface ISkeletonProps extends Partial<ISkeletonVariants> {
  className?: string
}

export type { ISkeletonProps, ISkeletonVariants }
