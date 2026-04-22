import type { IRoutes } from '@/type'

export const ROUTES: IRoutes = {
  home: {
    path: '/',
  },
  patientAction: {
    path: '/patients/:patientId/action',
    getUrl: (patientId: string) => `/patients/${patientId}/action`,
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
