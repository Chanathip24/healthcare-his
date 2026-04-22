import { createBrowserRouter, RouterProvider, ScrollRestoration } from 'react-router-dom'

import { Layout } from '@/components/layout'
import { ROUTES } from '@/constant'
import EncounterDetail from '@/page/EncounterDetail'
import Encounters from '@/page/Encounters'
import Home from '@/page/Home'
import Medications from '@/page/Medications'
import PatientDetail from '@/page/PatientDetail'
import Practitioners from '@/page/Practitioners'

const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  {
    element: (
      <>
        <ScrollRestoration />
        <Layout />
      </>
    ),
    children: [
      {
        path: ROUTES.home.path,
        element: <Home />,
      },
      {
        path: ROUTES.patientDetail.path,
        element: <PatientDetail />,
      },
      {
        path: ROUTES.encounterDetail.path,
        element: <EncounterDetail />,
      },
      {
        path: ROUTES.practitioners.path,
        element: <Practitioners />,
      },
      {
        path: ROUTES.encounters.path,
        element: <Encounters />,
      },
      {
        path: ROUTES.medications.path,
        element: <Medications />,
      },
    ],
  },
])

const Router = () => {
  return <RouterProvider router={router} />
}
export default Router
