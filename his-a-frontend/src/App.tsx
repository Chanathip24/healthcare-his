import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

import { SidebarProvider } from './components/common'
import Router from './router'

const queryClient: QueryClient = new QueryClient()

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <Router />
        <Toaster />
      </SidebarProvider>
    </QueryClientProvider>
  )
}
export default App
