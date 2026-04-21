import type { PropsWithChildren } from 'react'

import { useSidebar } from '@/components/common'
import { SidebarState } from '@/enums'
import { useIsMobile } from '@/hooks'
import { cn } from '@/utilities'

type IOutletWrapperProps = PropsWithChildren<{
  isSidebar?: boolean
}>

const OutletWrapper = ({ children, isSidebar = true }: IOutletWrapperProps) => {
  const { state: sidebarState } = useSidebar()
  const isMobile: boolean = useIsMobile()
  return (
    <div
      className={cn('r flex min-h-dvh flex-col overflow-y-auto', [
        isSidebar && 'ml-(--sidebar-width) min-w-[calc(100dvw-var(--sidebar-width))]',
        sidebarState === SidebarState.COLLAPSED && 'ml-12 min-w-dvw',
        isMobile && 'ml-0 min-w-full',
      ])}
    >
      {children}
    </div>
  )
}

export default OutletWrapper
