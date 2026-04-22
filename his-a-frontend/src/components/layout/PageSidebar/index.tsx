import { HospitalIcon, type LucideIcon, Pill, Stethoscope, Users } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { type NavigateFunction, useLocation, useNavigate } from 'react-router-dom'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/common'
import { HOSPITAL_NAME } from '@/config'
import { ROUTES } from '@/constant'
import { SidebarState } from '@/enums'
import { cn } from '@/utilities'

const items: Array<{ key: string; title: string; icon: LucideIcon }> = [
  { key: ROUTES.home.path, title: 'Patients', icon: Users },
  { key: ROUTES.practitioners.path, title: 'Practitioners', icon: Stethoscope },
  { key: ROUTES.encounters.path, title: 'Encounters', icon: Stethoscope },
  { key: ROUTES.medications.path, title: 'Medications', icon: Pill },
]

export function PageSidebar() {
  const navigate: NavigateFunction = useNavigate()
  const { state: sidebarState } = useSidebar()
  const currentPath: string = useLocation().pathname

  const isSidebarExpanded: boolean = useMemo(() => sidebarState === SidebarState.EXPANDED, [sidebarState])
  const handleNavigate = useCallback(
    (key: string): void => {
      navigate(key)
    },
    [navigate],
  )

  return (
    <Sidebar collapsible="icon" className="h-full **:data-[slot=sidebar-inner]:h-full">
      <SidebarHeader className="border-b border-theme-sidebar-border">
        <div className={cn('flex items-center gap-2', isSidebarExpanded && 'px-2 py-1.5')}>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-theme-sidebar-accent">
            <HospitalIcon className="size-4" />
          </div>
          {isSidebarExpanded && (
            <div className="min-w-0">
              <p className="truncate text-body-2 leading-tight font-semibold">{HOSPITAL_NAME}</p>
              <p className="truncate text-body-3 leading-tight text-theme-gray">Hospital Info System</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Directories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={currentPath === item.key}
                    onClick={(): void => handleNavigate(item.key)}
                    tooltip={item.title}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
