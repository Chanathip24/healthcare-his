import type { IPaginate } from '@/type'

export type IPaginationBarProps = Omit<IPaginate, 'size'> & {
  isLoading?: boolean
  onPageChange: (page: number) => void
}
