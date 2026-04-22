import type { EncountersResponse, HisEncounterQueryClientKeys, IGetEncounterByIdResponse } from '@/type'

import { HisBaseClient } from '../HisBaseClient'

export class HisEncounterQueryClient extends HisBaseClient {
  readonly key: Record<HisEncounterQueryClientKeys, string> = {
    getAllEncounters: 'getAllEncounters',
    getPatientEncounters: 'getPatientEncounters',
    getEncounterById: 'getEncounterById',
  }

  async listEncounters(): Promise<EncountersResponse['data']> {
    const response = await this.axiosInstance.get<EncountersResponse>(`/encounters`)
    return response.data.data
  }

  async getPatientEncounters(patientId: string): Promise<EncountersResponse['data']> {
    const response = await this.axiosInstance.get<EncountersResponse>(`/patients/${patientId}/encounters`)
    return response.data.data
  }

  async getEncounterById(encounterId: string): Promise<IGetEncounterByIdResponse['data']> {
    const response = await this.axiosInstance.get<IGetEncounterByIdResponse>(`/encounters/${encounterId}`)
    return response.data.data
  }
}
