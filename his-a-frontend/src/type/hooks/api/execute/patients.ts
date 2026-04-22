import type { IBaseUseMutation, IFhirPatient, IHisApiClientBaseResponse } from '@/type'

//API Response
export type IHisApiClientExecutePatientsResponse = IHisApiClientBaseResponse<IFhirPatient>

//HOOK
export type IUseExecutePatients = IBaseUseMutation<IFhirPatient, IHisApiClientExecutePatientsResponse['data']>
