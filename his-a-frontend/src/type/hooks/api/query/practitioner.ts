import { EFhirAdministrativeGender, EFhirPractitionerResourceType } from '@/enums'
import type { IHisApiClientBaseResponse } from '@/type'

export type IFhirPractitionerIdentifier = {
  system: string
  value: string
}

export type IFhirPractitionerName = {
  use?: string
  family?: string
  given?: Array<string>
  text?: string
}

export type IFhirPractitionerTelecom = {
  system: string
  value: string
  use?: string
}

export type IFhirPractitioner = {
  resourceType: EFhirPractitionerResourceType
  id: string
  identifier?: Array<IFhirPractitionerIdentifier>
  active?: boolean
  name?: Array<IFhirPractitionerName>
  telecom?: Array<IFhirPractitionerTelecom>
  gender?: EFhirAdministrativeGender
  birthDate?: string
}

export type IFhirPractitionerBundleEntry = {
  fullUrl: string
  resource: IFhirPractitioner
  search?: {
    mode: 'match' | 'include' | 'outcome'
  }
}

export type IFhirPractitionerSearchBundle = {
  resourceType: 'Bundle'
  id: string
  type: 'searchset'
  total?: number
  entry?: Array<IFhirPractitionerBundleEntry>
}

export type IGetPractitionerByIdResponse = IHisApiClientBaseResponse<IFhirPractitioner>
export type IListPractitionersResponse = IHisApiClientBaseResponse<IFhirPractitionerSearchBundle>
