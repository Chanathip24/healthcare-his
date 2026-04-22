import type { HTMLAttributes, PropsWithChildren } from 'react'

import { cn } from '@/utilities'

type ISectionProps = PropsWithChildren<HTMLAttributes<HTMLDivElement> & { sectionClassName?: string }>
const Section = ({ className, sectionClassName, children, ...props }: ISectionProps) => {
  return (
    <div className={cn('flex justify-center px-4 py-6 desktop:px-6', sectionClassName)}>
      <div className={cn('w-full max-w-[1200px] space-y-6 desktop:w-[92%]', className)} {...props}>
        {children}
      </div>
    </div>
  )
}

export default Section
