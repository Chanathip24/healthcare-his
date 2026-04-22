import type { HisMedicationQueryClientKeys, IFhirMedicationRequestSearchBundle } from '@/type'

import { HisBaseClient } from '../HisBaseClient'

export class HisMedicationQueryClient extends HisBaseClient {
  readonly key: Record<HisMedicationQueryClientKeys, string> = {
    getPatientMedications: 'getPatientMedications',
  }

  async getPatientMedications(patientId: string): Promise<IFhirMedicationRequestSearchBundle['data']> {
    const response = await this.axiosInstance.get<IFhirMedicationRequestSearchBundle>(
      `/patients/${patientId}/medication-requests`,
    )
    return response.data.data
  }
}
