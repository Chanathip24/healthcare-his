import { useMutation, useQueryClient } from '@tanstack/react-query'

import { API_BASE_URL } from '@/config'
import { HisMedicationExecuteClient, HisMedicationQueryClient } from '@/hooks'
import type {
  IFhirMedicationRequest,
  IFhirMedicationRequestBundleEntry,
  IFhirMedicationRequestSearchBundle,
} from '@/type'

type ICreatePatientMedicationPayload = {
  patientId: string
  payload: IFhirMedicationRequest
}

export const useHisApiExecuteCreatePatientMedication = () => {
  const hisMedicationExecuteClient: HisMedicationExecuteClient = new HisMedicationExecuteClient(API_BASE_URL)
  const hisMedicationQueryClient: HisMedicationQueryClient = new HisMedicationQueryClient(API_BASE_URL)
  const queryClient = useQueryClient()

  return useMutation<IFhirMedicationRequest, Error, ICreatePatientMedicationPayload>({
    mutationKey: [hisMedicationExecuteClient.key.createPatientMedication],
    mutationFn: ({ patientId, payload }) => hisMedicationExecuteClient.createPatientMedication(payload, patientId),
    onSuccess: (createdMedication, variables) => {
      queryClient.setQueriesData<IFhirMedicationRequestSearchBundle['data']>(
        {
          queryKey: [hisMedicationQueryClient.key.getPatientMedications, variables.patientId],
          exact: false,
        },
        (currentCache) => {
          if (!currentCache) return currentCache

          const newEntry: IFhirMedicationRequestBundleEntry = {
            fullUrl: `MedicationRequest/${createdMedication.id}`,
            resource: createdMedication,
            search: { mode: 'match' },
          }
          const currentEntries = currentCache.entry ?? []
          const hasMedication = currentEntries.some((entry) => entry.resource.id === createdMedication.id)
          const updatedEntries = hasMedication ? currentEntries : [newEntry, ...currentEntries]

          return {
            ...currentCache,
            entry: updatedEntries,
            total: Math.max(currentCache.total ?? 0, updatedEntries.length),
          }
        },
      )
    },
  })
}
