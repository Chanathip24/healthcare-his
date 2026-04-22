import { useQuery } from '@tanstack/react-query'

import { API_BASE_URL } from '@/config'
import { HisEncounterQueryClient } from '@/hooks'
import type { IFhirEncounterSearchBundle } from '@/type'

export const useHisApiQueryEncounters = () => {
  const hisEncounterQueryClient: HisEncounterQueryClient = new HisEncounterQueryClient(API_BASE_URL)

  return useQuery<IFhirEncounterSearchBundle>({
    queryKey: [hisEncounterQueryClient.key.getAllEncounters],
    queryFn: () => hisEncounterQueryClient.listEncounters(),
  })
}
