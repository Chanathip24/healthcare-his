import type {
  IFhirBundleLink,
  IFhirBundleMeta,
  IFhirBundleSearch,
  IFhirMedicationRequest,
  IHisApiClientBaseResponse,
} from '@/type'

export type IFhirCoding = {
  system: string
  code: string
  display?: string
}

export type IFhirCodeableConcept = {
  coding?: Array<IFhirCoding>
  text?: string
}

export type IFhirReference = {
  reference: string
  display?: string
}

export type IFhirDosageInstruction = {
  text?: string
  timing?: {
    repeat?: {
      frequency?: number
      period?: number
      periodUnit?: string
    }
  }
  route?: {
    coding?: Array<IFhirCoding>
  }
  doseAndRate?: Array<{
    doseQuantity?: {
      value?: number
      unit?: string
    }
  }>
}

export type IFhirDispenseRequest = {
  quantity?: {
    value?: number
    unit?: string
  }
  expectedSupplyDuration?: {
    value?: number
    unit?: string
  }
}

export type IFhirMedicationRequestBundleEntry = {
  fullUrl: string
  resource: IFhirMedicationRequest
  search?: IFhirBundleSearch
}

//get all patient medications
export type IFhirMedicationRequestSearchBundle = IHisApiClientBaseResponse<{
  resourceType: 'Bundle'
  id: string
  meta?: IFhirBundleMeta
  type: 'searchset'
  total?: number
  link?: Array<IFhirBundleLink>
  entry?: Array<IFhirMedicationRequestBundleEntry>
}>
