import type { HisPatientClientKeys, IHisApiClientQueryPatientById, IHisApiClientQueryPatients } from '@/type'

import { HisBaseClient } from '../HisBaseClient'

export class HisPatientsQueryClient extends HisBaseClient {
  readonly key: Record<HisPatientClientKeys, string> = {
    getAllPatients: 'getAllPatients',
    getPatientById: 'getPatientById',
  }

  async listPatients(): Promise<IHisApiClientQueryPatients['data']> {
    const response = await this.axiosInstance.get<IHisApiClientQueryPatients>(`/patients`)
    return response.data.data
  }
  async getPatientById(id: string): Promise<IHisApiClientQueryPatientById['data']> {
    const response = await this.axiosInstance.get<IHisApiClientQueryPatientById>(`/patients/${id}`)
    return response.data.data
  }
}
