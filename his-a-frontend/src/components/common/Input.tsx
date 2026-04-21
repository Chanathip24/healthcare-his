import { type InputHTMLAttributes, type ReactNode, type RefAttributes } from 'react'

import { cn } from '@/utilities'

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> &
  RefAttributes<HTMLInputElement> & {
    prefix?: ReactNode
    suffix?: ReactNode
    error?: string
  }
const INPUT_CLASSNAME: string =
  'placeholder:text-body-2 text-body-1 desktop:text-body-2 file:text-body-2 flex w-full rounded-lg px-3 py-2 outline-none file:border-0 file:bg-transparent file:font-medium placeholder:font-medium focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'

const Input = ({ className, type, prefix, suffix, error, ref, ...props }: InputProps) => {
  return (
    <div className="flex w-full flex-col justify-center gap-3 rounded-lg duration-75 focus-within:ring-1 focus-within:ring-theme-primary">
      <div
        className={cn(
          'flex items-center gap-x-2 rounded-lg border border-page py-0.5 focus-within:border-theme-primary focus:ring-1',
          [error || (props?.['aria-invalid'] && 'border-theme-destructive'), prefix && 'px-2', suffix && 'pr-2'],
          className,
        )}
      >
        {prefix && <div>{prefix}</div>}
        <input type={type} className={INPUT_CLASSNAME} ref={ref} {...props} />
        {suffix && <div>{suffix}</div>}
      </div>
      {error && <span className="text-error -mt-2 text-body-2">{error}</span>}
    </div>
  )
}
Input.displayName = 'Input'

export { Input }
