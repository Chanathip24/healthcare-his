import type { ReactNode } from 'react'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../Empty'
import { Spinner } from '../Spinner'

type ILoadingPageProps = {
  icon?: ReactNode
  message?: string
  description?: string
}

const LoadingPage = ({
  icon = <Spinner />,
  message = 'Loading...',
  description = 'Please wait while we load the page.',
}: ILoadingPageProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">{icon}</EmptyMedia>
          <EmptyTitle>{message}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}

export default LoadingPage
