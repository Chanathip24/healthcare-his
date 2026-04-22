import type { HisMedicationExecuteClientKeys, IFhirMedicationRequest, IMedicationResponse } from '@/type'

import { HisBaseClient } from '../HisBaseClient'

export class HisMedicationExecuteClient extends HisBaseClient {
  readonly key: Record<HisMedicationExecuteClientKeys, string> = {
    createPatientMedication: 'createPatientMedication',
  }

  async createPatientMedication(
    payload: IFhirMedicationRequest,
    patientId: string,
  ): Promise<IMedicationResponse['data']> {
    const response = await this.axiosInstance.post<IMedicationResponse>(
      `/patients/${patientId}/medication-requests`,
      payload,
    )
    return response.data.data
  }
}
