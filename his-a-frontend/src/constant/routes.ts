import type { IRoutes } from '@/type'

export const ROUTES: IRoutes = {
  home: {
    path: '/',
  },
  patientDetail: {
    path: '/patients/:patientId',
  },
  encounterDetail: {
    path: '/patients/:patientId/encounters/:encounterId',
  },
  practitioners: {
    path: '/practitioners',
  },
  encounters: {
    path: '/encounters',
  },
  medications: {
    path: '/medications',
  },
}
