import { createBrowserRouter, RouterProvider, ScrollRestoration } from 'react-router-dom'

import { Layout } from '@/components/layout'
import { ROUTES } from '@/constant'
import Encounters from '@/page/Encounters'
import Home from '@/page/Home'
import Medications from '@/page/Medications'

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
