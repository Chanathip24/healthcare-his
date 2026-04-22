import { useMutation } from '@tanstack/react-query'

import { API_BASE_URL } from '@/config'
import { HisPractitionerExecuteClient } from '@/hooks'
import type { ICreatePractitionerPayload, ICreatePractitionerResponse } from '@/type'

export const useHisApiExecuteCreatePractitioner = () => {
  const hisPractitionerExecuteClient: HisPractitionerExecuteClient = new HisPractitionerExecuteClient(API_BASE_URL)

  return useMutation<ICreatePractitionerResponse, Error, ICreatePractitionerPayload>({
    mutationKey: [hisPractitionerExecuteClient.key.createPractitioner],
    mutationFn: (payload) => hisPractitionerExecuteClient.createPractitioner(payload),
  })
}
