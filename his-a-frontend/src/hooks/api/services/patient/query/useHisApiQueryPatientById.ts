import { useQuery } from '@tanstack/react-query'

import { API_BASE_URL } from '@/config'
import { HisPatientsQueryClient } from '@/hooks'
import type { IHisApiClientQueryPatientById, IUseQueryPatientById } from '@/type'

export const useHisApiQueryPatientById = (params: { patientId: string; enabled?: boolean }): IUseQueryPatientById => {
  const hisPatientsQueryClient: HisPatientsQueryClient = new HisPatientsQueryClient(API_BASE_URL)

  return useQuery<IHisApiClientQueryPatientById['data']>({
    queryKey: [hisPatientsQueryClient.key.getPatientById, params.patientId],
    queryFn: () => hisPatientsQueryClient.getPatientById(params.patientId),
    enabled: params.enabled,
  })
}
