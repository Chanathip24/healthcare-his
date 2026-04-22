import { useQuery } from '@tanstack/react-query'

import { API_BASE_URL } from '@/config'
import { HisMedicationQueryClient } from '@/hooks'

export const useHisApiQueryPatientMedications = (params: { patientId: string; enabled?: boolean }) => {
  const hisMedicationQueryClient: HisMedicationQueryClient = new HisMedicationQueryClient(API_BASE_URL)

  return useQuery({
    queryKey: [hisMedicationQueryClient.key.getPatientMedications, params.patientId],
    queryFn: () => hisMedicationQueryClient.getPatientMedications(params.patientId),
    enabled: params.enabled,
  })
}
