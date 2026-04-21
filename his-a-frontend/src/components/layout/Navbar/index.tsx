import { SidebarIcon } from 'lucide-react'

import { Button, useSidebar } from '@/components/common'

const Navbar = ({ currentPageName }: { currentPageName?: string }) => {
  const { toggleSidebar } = useSidebar()
  return (
    <header className="z-50 flex h-(--header-height) items-center gap-x-2 border-b border-page bg-theme-white px-4">
      <Button size="icon" variant="ghost" onClick={toggleSidebar}>
        <SidebarIcon className="size-4" />
      </Button>
      <p className="text-body-2 tracking-tight text-theme-gray">{currentPageName}</p>
    </header>
  )
}

export default Navbar
