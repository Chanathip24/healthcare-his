import { API_BASE_URL } from '@/config'
import { HisBaseClient } from '@/hooks/api/client'
import type {
  IAddEncounterMedicationPayload,
  ICreatePatientPayload,
  IEncounterDetail,
  IEncounter,
  IHisApiClientBaseResponse,
  IMedication,
  IPatient,
} from '@/type'

const hisBaseClient = new HisBaseClient(API_BASE_URL)

const buildSearchQuery: (query: string) => string = (query: string): string => {
  const normalizedQuery: string = query.trim()
  if (!normalizedQuery) return ''

  const searchParams: URLSearchParams = new URLSearchParams({ query: normalizedQuery })
  return `?${searchParams.toString()}`
}

export const listPatients: (query: string) => Promise<Array<IPatient>> = async (query: string): Promise<Array<IPatient>> => {
  const response = await hisBaseClient.axiosInstance.get<IHisApiClientBaseResponse<Array<IPatient>>>(
    `/api/v1/patients${buildSearchQuery(query)}`,
  )

  return response.data.data || []
}

export const createPatient: (payload: ICreatePatientPayload) => Promise<IPatient> = async (
  payload: ICreatePatientPayload,
): Promise<IPatient> => {
  const response = await hisBaseClient.axiosInstance.post<IHisApiClientBaseResponse<IPatient>>('/api/v1/patients', payload)
  if (!response.data.data) throw new Error('Failed to create patient.')
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
