import type {
  IFhirCodeableConcept,
  IFhirDispenseRequest,
  IFhirDosageInstruction,
  IFhirReference,
  IHisApiClientBaseResponse,
} from '@/type'

export type IFhirMedicationRequest = {
  resourceType: 'MedicationRequest'
  id: string
  status: string
  intent: string
  medicationCodeableConcept: IFhirCodeableConcept
  subject: IFhirReference
  encounter: IFhirReference
  authoredOn?: string
  requester?: IFhirReference
  dosageInstruction?: Array<IFhirDosageInstruction>
  dispenseRequest?: IFhirDispenseRequest
}

export type IMedicationResponse = IHisApiClientBaseResponse<IFhirMedicationRequest>
