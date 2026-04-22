import type { EFhirAdministrativeGender, EFhirPatientResourceType } from '@/enums'
import type { IBaseUseQueryResult, IHisApiClientBaseResponse } from '@/type'

export type IFhirPatient = {
  resourceType: EFhirPatientResourceType
  id: string
  meta: IFhirMeta
  text?: IFhirNarrative
  identifier?: Array<IFhirIdentifier>
  active: boolean
  name: Array<IFhirPatientName>
  telecom?: Array<IFhirTelecom>
  gender: EFhirAdministrativeGender
  birthDate: string
  address?: Array<IFhirAddress>
}

export type IFhirMeta = {
  versionId: string
  lastUpdated: string
}

export type IFhirNarrative = {
  status: string
  div: string
}

export type IFhirIdentifier = {
  system: string
  value: string
}

export type IFhirPatientName = {
  use?: string
  text: string
  family?: string
  given?: Array<string>
  prefix?: Array<string>
}

export type IFhirTelecom = {
  system: string
  value: string
  use: string
}

export type IFhirAddress = {
  use: string
  type: string
  text: string
  line: Array<string>
  city: string
  district: string
  state: string
  postalCode: string
}

export type IFhirBundleMeta = {
  lastUpdated: string
}

export type IFhirBundleLink = {
  relation: string
  url: string
}

export type IFhirBundleSearch = {
  mode: 'match' | 'include' | 'outcome'
}

export type IFhirPatientBundleEntry = {
  fullUrl: string
  resource: IFhirPatient
  search: IFhirBundleSearch
}

//get all
export type IFhirPatientSearchBundle = {
  resourceType: 'Bundle'
  id: string
  meta: IFhirBundleMeta
  type: 'searchset'
  total: number
  link: Array<IFhirBundleLink>
  entry: Array<IFhirPatientBundleEntry>
}

//API RESPONSE CLIENT
export type IHisApiClientQueryPatients = IHisApiClientBaseResponse<IFhirPatientSearchBundle>
export type IHisApiClientQueryPatientById = IHisApiClientBaseResponse<IFhirPatient>

//HOOK
export type IUseQueryPatients = IBaseUseQueryResult<IHisApiClientQueryPatients['data']>
export type IUseQueryPatientById = IBaseUseQueryResult<IHisApiClientQueryPatientById['data']>
