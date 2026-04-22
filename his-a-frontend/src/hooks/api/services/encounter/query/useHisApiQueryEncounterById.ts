import { useQuery } from '@tanstack/react-query'

import { API_BASE_URL } from '@/config'
import { HisEncounterQueryClient } from '@/hooks'

export const useHisApiQueryEncounterById = (params: { encounterId: string; enabled?: boolean }) => {
  const hisEncounterQueryClient: HisEncounterQueryClient = new HisEncounterQueryClient(API_BASE_URL)

  return useQuery({
    queryKey: [hisEncounterQueryClient.key.getEncounterById, params.encounterId],
    queryFn: () => hisEncounterQueryClient.getEncounterById(params.encounterId),
    enabled: params.enabled,
  })
}
