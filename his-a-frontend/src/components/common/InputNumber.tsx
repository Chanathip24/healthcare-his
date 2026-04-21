import { type ChangeEvent, type ReactNode } from 'react'

import { cn } from '@/utilities'

import { Input, type InputProps } from './Input'

type Props = InputProps & {
  value?: number | number
  prefix?: ReactNode
  suffix?: ReactNode
  decimal?: number

  onChange?: (...event: any) => void // any type from react-hook-from. good to be any
  error?: string
}

function InputNumber({ prefix, suffix, error, decimal, onChange, className, ...props }: Props) {
  return (
    <Input
      prefix={prefix}
      suffix={suffix}
      error={error}
      className={cn('text-body-2 desktop:text-body-1', className)}
      {...(onChange && {
        onChange: (e: ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value
          const pattern =
            decimal === 0 ? new RegExp(`^[0-9]+$`) : new RegExp(`^(?!0{2,})[0-9]+[.]?([0-9]{1,${decimal}})?$`)
          const isValid = e.target.value.match(pattern)
          if (!!isValid || e.target.value === '') {
            // change input value without begin with 0
            onChange(
              value.length > 1 && value?.[1] !== '.' && value?.[0] === '0' ? value.slice(1, value.length) : value,
            )
          }
        },
      })}
      {...props}
    />
  )
}

export { InputNumber }
