import type { HTMLAttributes } from 'react'

import { cn } from '@/utilities'

import { Separator } from './Seperator'

type ISeperatorWithText = {
  text: string
} & HTMLAttributes<HTMLDivElement>
const SeperatorWithText = ({ text, className, ...props }: ISeperatorWithText) => {
  return (
    <div className={cn('w-full max-w-sm', className)} {...props}>
      <div className="relative flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="shrink-0 px-2 text-body-3 text-theme-gray uppercase">{text}</span>
        <Separator className="flex-1" />
      </div>
    </div>
  )
}

export { SeperatorWithText }
