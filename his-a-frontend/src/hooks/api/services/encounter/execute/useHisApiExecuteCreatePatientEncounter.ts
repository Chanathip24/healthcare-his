import { useMutation, useQueryClient } from '@tanstack/react-query'

import { API_BASE_URL } from '@/config'
import { HisEncounterExecuteClient, HisEncounterQueryClient } from '@/hooks'
import type {
  IFhirEncounter,
  IFhirEncounterBundleEntry,
  IFhirEncounterPayload,
  IFhirEncounterSearchBundle,
} from '@/type'

type ICreatePatientEncounterPayload = {
  patientId: string
  payload: IFhirEncounterPayload
}

export const useHisApiExecuteCreatePatientEncounter = () => {
  const hisEncounterExecuteClient: HisEncounterExecuteClient = new HisEncounterExecuteClient(API_BASE_URL)
  const hisEncounterQueryClient: HisEncounterQueryClient = new HisEncounterQueryClient(API_BASE_URL)
  const queryClient = useQueryClient()

  return useMutation<IFhirEncounter, Error, ICreatePatientEncounterPayload>({
    mutationKey: [hisEncounterExecuteClient.key.createPatientEncounter],
    mutationFn: ({ patientId, payload }) => hisEncounterExecuteClient.createPatientEncounter(payload, patientId),
    onSuccess: (createdEncounter: IFhirEncounter, variable) => {
      queryClient.setQueryData<IFhirEncounterSearchBundle>(
        [hisEncounterQueryClient.key.getPatientEncounters, variable.patientId],
        (currentCache: IFhirEncounterSearchBundle | undefined) => {
          if (!currentCache) return currentCache

          const newEntry: IFhirEncounterBundleEntry = {
            fullUrl: `${API_BASE_URL}/Encounter/${createdEncounter.id}`,
            resource: createdEncounter,
            search: { mode: 'match' },
          }

          const updatedEntries = [
            newEntry,
            ...(currentCache.entry ?? []).filter((e) => String(e.resource?.id) !== String(createdEncounter.id)),
          ]

          return {
            ...currentCache,
            entry: updatedEntries.sort((a, b) => String(a.resource.id).localeCompare(String(b.resource.id))),
            total: updatedEntries.length,
          }
        },
      )
    },
  })
}
