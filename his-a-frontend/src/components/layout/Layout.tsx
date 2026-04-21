import { Outlet } from 'react-router-dom'

import Navbar from './Navbar'
import OutletWrapper from './OutletWrapper'
import { PageSidebar } from './PageSidebar'

type ILayout = {
  isSidebar?: boolean
  isNavbar?: boolean
}
const Layout = ({ isSidebar = true, isNavbar = true }: ILayout) => {
  return (
    <div className="relative min-h-dvh bg-page">
      {isSidebar && <PageSidebar />}
      <OutletWrapper isSidebar={isSidebar}>
        {isNavbar && <Navbar />}
        <Outlet />
      </OutletWrapper>
    </div>
  )
}

export default Layout
