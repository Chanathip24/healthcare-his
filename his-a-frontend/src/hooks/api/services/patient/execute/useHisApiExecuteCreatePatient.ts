import { useMutation } from '@tanstack/react-query'

import { API_BASE_URL } from '@/config'
import { HisPatientsExecuteClient } from '@/hooks'
import type { IFhirPatient, IHisApiClientExecutePatientsResponse } from '@/type'

export const useHisApiExecuteCreatePatient = () => {
  const hisPatientsExecuteClient: HisPatientsExecuteClient = new HisPatientsExecuteClient(API_BASE_URL)

  return useMutation<IHisApiClientExecutePatientsResponse, Error, IFhirPatient>({
    mutationKey: [hisPatientsExecuteClient.key.createPatient],
    mutationFn: (patient) => hisPatientsExecuteClient.createPatient(patient),
  })
}
