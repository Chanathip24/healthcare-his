import type { ComponentProps } from 'react'

import { cn } from '@/utilities'

function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'focus-visible:border-ring disabled:bg-input/50 flex field-sizing-content min-h-16 w-full rounded-lg border border-theme-gray-700/70 bg-transparent px-2.5 py-2 text-body-1 transition-colors outline-none placeholder:text-body-2 focus-visible:ring-3 focus-visible:ring-theme-primary disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-theme-destructive aria-invalid:ring-3 aria-invalid:ring-theme-destructive/20 desktop:text-body-2',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
