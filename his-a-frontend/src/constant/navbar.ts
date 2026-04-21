import { HomeIcon } from 'lucide-react'

import type { INavbarItem } from '@/type'

import { ROUTES } from './routes'

export const BOTTOM_NAVBAR_ITEMS: Array<INavbarItem> = [{ to: ROUTES.home.path, icon: HomeIcon, label: 'Home' }]
