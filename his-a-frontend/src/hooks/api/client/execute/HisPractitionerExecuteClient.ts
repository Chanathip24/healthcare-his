import type { HisPractitionerExecuteClientKeys, ICreatePractitionerPayload, ICreatePractitionerResponse } from '@/type'

import { HisBaseClient } from '../HisBaseClient'

export class HisPractitionerExecuteClient extends HisBaseClient {
  readonly key: Record<HisPractitionerExecuteClientKeys, string> = {
    createPractitioner: 'createPractitioner',
  }

  async createPractitioner(payload: ICreatePractitionerPayload): Promise<ICreatePractitionerResponse> {
    const response = await this.axiosInstance.post(`/practitioners`, payload)
    return response.data.data
  }
}
