import type { HisPatientExecuteClientKeys, IFhirPatient, IHisApiClientExecutePatientsResponse } from '@/type'

import { HisBaseClient } from '../HisBaseClient'

export class HisPatientsExecuteClient extends HisBaseClient {
  readonly key: Record<HisPatientExecuteClientKeys, string> = {
    createPatient: 'createPatient',
  }

  async createPatient(patient: IFhirPatient): Promise<IHisApiClientExecutePatientsResponse> {
    const response = await this.axiosInstance.post<IHisApiClientExecutePatientsResponse>(`/patients`, patient)
    return response.data
  }
}
