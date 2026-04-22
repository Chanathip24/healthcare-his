import type { IRoutes } from '@/type'

export const ROUTES: IRoutes = {
  home: {
    path: '/',
  },
  encounters: {
    path: '/encounters',
  },
  encounterDetail: {
    path: '/encounters/:encounterId',
    getUrl: (encounterId: string) => `/encounters/${encounterId}`,
  },
  medications: {
    path: '/medications',
  },
}
