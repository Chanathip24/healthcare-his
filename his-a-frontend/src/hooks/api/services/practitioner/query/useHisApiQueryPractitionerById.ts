import { useQuery } from '@tanstack/react-query'

import { API_BASE_URL } from '@/config'
import { HisPractitionerQueryClient } from '@/hooks'
import type { IGetPractitionerByIdResponse } from '@/type'

export const useHisApiQueryPractitionerById = (params: { practitionerId: string }) => {
  const hisPractitionerQueryClient: HisPractitionerQueryClient = new HisPractitionerQueryClient(API_BASE_URL)

  return useQuery<IGetPractitionerByIdResponse['data']>({
    queryKey: [hisPractitionerQueryClient.key.getPractitionerById, params.practitionerId],
    queryFn: () => hisPractitionerQueryClient.getPractitionerById(params.practitionerId),
  })
}
