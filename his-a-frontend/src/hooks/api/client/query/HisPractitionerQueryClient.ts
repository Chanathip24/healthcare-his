import type { HisPractitionerQueryClientKeys, IGetPractitionerByIdResponse, IListPractitionersResponse } from '@/type'

import { HisBaseClient } from '../HisBaseClient'

export class HisPractitionerQueryClient extends HisBaseClient {
  readonly key: Record<HisPractitionerQueryClientKeys, string> = {
    getAllPractitioners: 'getAllPractitioners',
    getPractitionerById: 'getPractitionerById',
  }

  async listPractitioners(): Promise<IListPractitionersResponse['data']> {
    const response = await this.axiosInstance.get<IListPractitionersResponse>(`/practitioners`)
    return response.data.data
  }

  async getPractitionerById(id: string): Promise<IGetPractitionerByIdResponse['data']> {
    const response = await this.axiosInstance.get<IGetPractitionerByIdResponse>(`/practitioners/${id}`)
    return response.data.data
  }
}
