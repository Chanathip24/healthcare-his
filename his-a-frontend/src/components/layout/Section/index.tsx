import type { HTMLAttributes, PropsWithChildren } from 'react'

import { cn } from '@/utilities'

type ISectionProps = PropsWithChildren<HTMLAttributes<HTMLDivElement> & { sectionClassName?: string }>
const Section = ({ className, sectionClassName, children, ...props }: ISectionProps) => {
  return (
    <div className={cn('flex justify-center py-6', sectionClassName)}>
      <div className={cn('w-7/8 space-y-6 desktop:w-15/16', className)} {...props}>
        {children}
      </div>
    </div>
  )
}

export default Section
