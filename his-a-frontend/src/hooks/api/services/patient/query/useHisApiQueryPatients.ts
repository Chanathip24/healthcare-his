import { useQuery } from '@tanstack/react-query'

import { API_BASE_URL } from '@/config'
import { HisPatientsQueryClient } from '@/hooks'
import type { IHisApiClientQueryPatients } from '@/type'

export const useHisApiQueryPatients = () => {
  const hisPatientsQueryClient: HisPatientsQueryClient = new HisPatientsQueryClient(API_BASE_URL)

  return useQuery<IHisApiClientQueryPatients['data']>({
    queryKey: [hisPatientsQueryClient.key.getAllPatients],
    queryFn: () => hisPatientsQueryClient.listPatients(),
  })
}
