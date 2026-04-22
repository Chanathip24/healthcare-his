import type {
  IFhirBundleLink,
  IFhirBundleMeta,
  IFhirBundleSearch,
  IFhirReference,
  IHisApiClientBaseResponse,
} from '@/type'

export type IFhirEncounterClass = {
  system: string
  code: string
  display?: string
}

export type IFhirEncounterParticipant = {
  individual?: IFhirReference
}

export type IFhirEncounterLocation = {
  location: IFhirReference
}

export type IFhirEncounterPeriod = {
  start: string
  end?: string
}

export type IFhirEncounter = {
  resourceType: 'Encounter'
  id: string
  status: string
  class: IFhirEncounterClass
  subject: IFhirReference
  participant?: Array<IFhirEncounterParticipant>
  period?: IFhirEncounterPeriod
  reasonCode?: Array<{ text?: string }>
  serviceProvider?: IFhirReference
  location?: Array<IFhirEncounterLocation>
}

export type IHisApiClientEncounter = IHisApiClientBaseResponse<IFhirEncounter>

export type IFhirEncounterBundleEntry = {
  fullUrl: string
  resource: IFhirEncounter
  search?: IFhirBundleSearch
}

export type EncountersResponse = IHisApiClientBaseResponse<IFhirEncounterSearchBundle>
export type IFhirEncounterSearchBundle = {
  resourceType: 'Bundle'
  id: string
  meta?: IFhirBundleMeta
  type: 'searchset'
  total?: number
  link?: Array<IFhirBundleLink>
  entry?: Array<IFhirEncounterBundleEntry>
}

export type IGetEncounterByIdResponse = IHisApiClientBaseResponse<IFhirEncounter>
