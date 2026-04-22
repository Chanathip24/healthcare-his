import type { HisEncounterExecuteClientKeys, IFhirEncounterPayload, IHisApiClientEncounter } from '@/type'

import { HisBaseClient } from '../HisBaseClient'

export class HisEncounterExecuteClient extends HisBaseClient {
  readonly key: Record<HisEncounterExecuteClientKeys, string> = {
    createPatientEncounter: 'createPatientEncounter',
  }

  async createPatientEncounter(
    payload: IFhirEncounterPayload,
    patientId: string,
  ): Promise<IHisApiClientEncounter['data']> {
    const response = await this.axiosInstance.post<IHisApiClientEncounter>(`/patients/${patientId}/encounters`, payload)
    return response.data.data
  }
}
