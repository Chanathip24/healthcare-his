import type { ComponentProps } from 'react'

export interface IPaginationButtonProps extends ComponentProps<'button'> {
  isEllipsis?: boolean
  isActive?: boolean
}

export interface IPaginationNavigationProps extends IPaginationButtonProps {
  direction: 'previous' | 'next'
}

export type IPaginationEllipsisProps = IPaginationButtonProps
