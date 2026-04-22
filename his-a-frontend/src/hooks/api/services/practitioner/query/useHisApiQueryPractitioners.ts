import { useQuery } from '@tanstack/react-query'

import { API_BASE_URL } from '@/config'
import { HisPractitionerQueryClient } from '@/hooks'
import type { IListPractitionersResponse } from '@/type'

export const useHisApiQueryPractitioners = () => {
  const hisPractitionerQueryClient: HisPractitionerQueryClient = new HisPractitionerQueryClient(API_BASE_URL)

  return useQuery<IListPractitionersResponse['data']>({
    queryKey: [hisPractitionerQueryClient.key.getAllPractitioners],
    queryFn: () => hisPractitionerQueryClient.listPractitioners(),
  })
}
