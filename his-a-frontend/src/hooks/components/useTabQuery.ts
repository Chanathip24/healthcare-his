import { useCallback } from 'react'
import { type NavigateFunction, useNavigate, useSearchParams } from 'react-router-dom'

export const useTabQuery = (defaultTab: string): { currentTab: string; setTab: (tab: string) => void } => {
  const [searchParams] = useSearchParams()
  const navigate: NavigateFunction = useNavigate()
  const currentTab: string = searchParams.get('tab') || defaultTab

  const setTab = useCallback(
    (tab: string): void => {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('tab', tab)
      navigate({ search: newParams.toString() }, { replace: true })
    },
    [navigate, searchParams],
  )

  return { currentTab, setTab }
}
