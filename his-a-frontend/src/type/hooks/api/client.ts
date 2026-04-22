export type IPatientGender = 'male' | 'female' | 'other'

export type IPatient = {
  id: string
  name: string
  gender: IPatientGender
  age: number
  createdAt: string
}

export type ICreatePatientPayload = {
  name: string
  gender: IPatientGender
  birthDate: string
  nationalId: string
  hospitalNumber: string
  namePrefix: string
  givenName: string
  familyName: string
  homePhone: string
  mobilePhone: string
  address: {
    text: string
    line: string
    city: string
    district: string
    state: string
    postalCode: string
  }
}

export type IPatientDetail = IPatient & {
  encounterCount: number
  medicationRequestCount: number
  fhirResource: Record<string, unknown>
}

export type IEncounterStatus = 'active' | 'finished' | 'cancelled'

export type IEncounter = {
  id: string
  date: string
  patientId: string
  patientName: string
  classDisplay: string
  status: IEncounterStatus
}

export type ICreateEncounterPayload = {
  date: string
  classDisplay: string
  status: IEncounterStatus
}

export type IEncounterMedication = {
  code: string
  drug: string
  dose: string
  frequency: string
}

export type IAddEncounterMedicationPayload = {
  code: string
  dose: string
  frequency: string
}

export type IEncounterDetail = IEncounter & {
  periodStart: string
  medications: Array<IEncounterMedication>
  fhirResource: Record<string, unknown>
}

export type IMedication = {
  code: string
  display: string
  strength: string
  system: string
}

export type IMedicationRequestStatus = 'active' | 'completed' | 'cancelled'

export type IMedicationRequest = {
  id: string
  patientId: string
  patientName: string
  encounterId: string
  status: IMedicationRequestStatus
  intent: 'order'
  medicationCode: string
  medicationDisplay: string
  dose: string
  frequency: string
  authoredOn: string
  fhirResource: Record<string, unknown>
}

export type ICreateMedicationRequestPayload = {
  encounterId: string
  code: string
  dose: string
  frequency: string
  authoredOn: string
  status: IMedicationRequestStatus
}
