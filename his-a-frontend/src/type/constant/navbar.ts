import type { LucideIcon } from 'lucide-react'

export type INavbarItem = {
  to: string
  icon: LucideIcon
  label: string
  isCenter?: boolean
}
