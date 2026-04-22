import { useQuery } from '@tanstack/react-query'

import { API_BASE_URL } from '@/config'
import { HisEncounterQueryClient } from '@/hooks'
import type { IFhirEncounterSearchBundle } from '@/type'

const hisEncounterQueryClient: HisEncounterQueryClient = new HisEncounterQueryClient(API_BASE_URL)

export const useHisApiQueryPatientEncounters = (params: { patientId: string; enabled?: boolean }) => {
  return useQuery<IFhirEncounterSearchBundle>({
    queryKey: [hisEncounterQueryClient.key.getPatientEncounters, params.patientId],
    queryFn: () => hisEncounterQueryClient.getPatientEncounters(params.patientId),
    enabled: params.enabled,
  })
}
