import { API_BASE_URL } from '@/config'
import { HisBaseClient } from '@/hooks/api/client'
import type {
  IAddEncounterMedicationPayload,
  ICreateEncounterPayload,
  ICreateMedicationRequestPayload,
  ICreatePatientPayload,
  IEncounter,
  IEncounterDetail,
  IHisApiClientBaseResponse,
  IMedication,
  IMedicationRequest,
  IPatient,
  IPatientDetail,
} from '@/type'

const hisBaseClient = new HisBaseClient(API_BASE_URL)

const buildSearchQuery: (query: string) => string = (query: string): string => {
  const normalizedQuery: string = query.trim()
  if (!normalizedQuery) return ''

  const searchParams: URLSearchParams = new URLSearchParams({ query: normalizedQuery })
  return `?${searchParams.toString()}`
}

export const listPatients: (query: string) => Promise<Array<IPatient>> = async (
  query: string,
): Promise<Array<IPatient>> => {
  const response = await hisBaseClient.axiosInstance.get<IHisApiClientBaseResponse<Array<IPatient>>>(
    `/api/v1/patients${buildSearchQuery(query)}`,
  )

  return response.data.data || []
}

export const createPatient: (payload: ICreatePatientPayload) => Promise<IPatient> = async (
  payload: ICreatePatientPayload,
): Promise<IPatient> => {
  const response = await hisBaseClient.axiosInstance.post<IHisApiClientBaseResponse<IPatient>>(
    '/api/v1/patients',
    payload,
  )
  if (!response.data.data) throw new Error('Failed to create patient.')
  return response.data.data
}

export const getPatientDetail: (patientId: string) => Promise<IPatientDetail> = async (
  patientId: string,
): Promise<IPatientDetail> => {
  const response = await hisBaseClient.axiosInstance.get<IHisApiClientBaseResponse<IPatientDetail>>(
    `/api/v1/patients/${encodeURIComponent(patientId)}`,
  )

  if (!response.data.data) throw new Error('Patient details not found.')
  return response.data.data
}

export const listPatientEncounters: (patientId: string) => Promise<Array<IEncounter>> = async (
  patientId: string,
): Promise<Array<IEncounter>> => {
  const response = await hisBaseClient.axiosInstance.get<IHisApiClientBaseResponse<Array<IEncounter>>>(
    `/api/v1/patients/${encodeURIComponent(patientId)}/encounters`,
  )

  return response.data.data || []
}

export const createPatientEncounter: (
  patientId: string,
  payload: ICreateEncounterPayload,
) => Promise<IEncounter> = async (patientId: string, payload: ICreateEncounterPayload): Promise<IEncounter> => {
  const response = await hisBaseClient.axiosInstance.post<IHisApiClientBaseResponse<IEncounter>>(
    `/api/v1/patients/${encodeURIComponent(patientId)}/encounters`,
    payload,
  )

  if (!response.data.data) throw new Error('Failed to create encounter.')
  return response.data.data
}

export const listPatientMedicationRequests: (patientId: string) => Promise<Array<IMedicationRequest>> = async (
  patientId: string,
): Promise<Array<IMedicationRequest>> => {
  const response = await hisBaseClient.axiosInstance.get<IHisApiClientBaseResponse<Array<IMedicationRequest>>>(
    `/api/v1/patients/${encodeURIComponent(patientId)}/medication-requests`,
  )

  return response.data.data || []
}

export const createPatientMedicationRequest: (
  patientId: string,
  payload: ICreateMedicationRequestPayload,
) => Promise<IMedicationRequest> = async (
  patientId: string,
  payload: ICreateMedicationRequestPayload,
): Promise<IMedicationRequest> => {
  const response = await hisBaseClient.axiosInstance.post<IHisApiClientBaseResponse<IMedicationRequest>>(
    `/api/v1/patients/${encodeURIComponent(patientId)}/medication-requests`,
    payload,
  )

  if (!response.data.data) throw new Error('Failed to create medication request.')
  return response.data.data
}

export const listEncounters: (query: string) => Promise<Array<IEncounter>> = async (
  query: string,
): Promise<Array<IEncounter>> => {
  const response = await hisBaseClient.axiosInstance.get<IHisApiClientBaseResponse<Array<IEncounter>>>(
    `/api/v1/encounters${buildSearchQuery(query)}`,
  )

  return response.data.data || []
}

export const listMedications: (query: string) => Promise<Array<IMedication>> = async (
  query: string,
): Promise<Array<IMedication>> => {
  const response = await hisBaseClient.axiosInstance.get<IHisApiClientBaseResponse<Array<IMedication>>>(
    `/api/v1/medications${buildSearchQuery(query)}`,
  )

  return response.data.data || []
}

export const getEncounterDetail: (encounterId: string) => Promise<IEncounterDetail> = async (
  encounterId: string,
): Promise<IEncounterDetail> => {
  const response = await hisBaseClient.axiosInstance.get<IHisApiClientBaseResponse<IEncounterDetail>>(
    `/api/v1/encounters/${encodeURIComponent(encounterId)}`,
  )

  if (!response.data.data) throw new Error('Encounter details not found.')
  return response.data.data
}

export const addEncounterMedication: (
  encounterId: string,
  payload: IAddEncounterMedicationPayload,
) => Promise<IEncounterDetail> = async (
  encounterId: string,
  payload: IAddEncounterMedicationPayload,
): Promise<IEncounterDetail> => {
  const response = await hisBaseClient.axiosInstance.post<IHisApiClientBaseResponse<IEncounterDetail>>(
    `/api/v1/encounters/${encodeURIComponent(encounterId)}/medications`,
    payload,
  )

  if (!response.data.data) throw new Error('Failed to add medication.')
  return response.data.data
}
