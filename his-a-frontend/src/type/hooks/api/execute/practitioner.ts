import { EFhirPractitionerResourceType } from '@/enums'
import type { IFhirPractitioner } from '@/type'

export type ICreatePractitionerPayload = Omit<IFhirPractitioner, 'id'> & {
  resourceType: EFhirPractitionerResourceType.Practitioner
}

export type ICreatePractitionerResponse = IFhirPractitioner
