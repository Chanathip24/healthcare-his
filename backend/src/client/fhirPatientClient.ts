import axios from "axios";
import {
  ICreateEncounterPayload,
  ICreateEncounterResponse,
  ICreateMedicationRequestPayload,
  ICreateMedicationRequestResponse,
  ICreatePatientPayload,
  ICreatePatientResponse,
  IGetEncounterByIdResponse,
  IGetPatientByIdResponse,
  IListEncountersResponse,
  IListPatientEncountersResponse,
  IListPatientMedicationRequestsResponse,
  IListPatientsResponse
} from "@/types/services";

export class FhirPatientClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async listPatients(): Promise<IListPatientsResponse> {
    const response = await axios.get<IListPatientsResponse>(`${this.baseUrl}/Patient`);
    return response.data;
  }

  async getPatientById(id: string): Promise<IGetPatientByIdResponse> {
    const response = await axios.get<IGetPatientByIdResponse>(`${this.baseUrl}/Patient/${encodeURIComponent(id)}`);
    return response.data;
  }

  async createPatient(payload: ICreatePatientPayload): Promise<ICreatePatientResponse> {
    const response = await axios.post<ICreatePatientResponse>(`${this.baseUrl}/Patient`, payload);
    return response.data;
  }

  async createMedicationRequest(payload: ICreateMedicationRequestPayload): Promise<ICreateMedicationRequestResponse> {
    const response = await axios.post<ICreateMedicationRequestResponse>(`${this.baseUrl}/MedicationRequest`, payload);
    return response.data;
  }

  async listPatientMedicationRequests(patientId: string): Promise<IListPatientMedicationRequestsResponse> {
    const encodedReference: string = encodeURIComponent(`Patient/${patientId}`);
    const response = await axios.get<IListPatientMedicationRequestsResponse>(
      `${this.baseUrl}/MedicationRequest?subject=${encodedReference}`
    );
    return response.data;
  }

  async createEncounter(payload: ICreateEncounterPayload): Promise<ICreateEncounterResponse> {
    const response = await axios.post<ICreateEncounterResponse>(`${this.baseUrl}/Encounter`, payload);
    return response.data;
  }

  async listPatientEncounters(patientId: string): Promise<IListPatientEncountersResponse> {
    const encodedReference: string = encodeURIComponent(`Patient/${patientId}`);
    const response = await axios.get<IListPatientEncountersResponse>(`${this.baseUrl}/Encounter?subject=${encodedReference}`);
    return response.data;
  }

  async listEncounters(encounterId?: string): Promise<IListEncountersResponse> {
    const query: string = encounterId?.trim() ? `?_id=${encodeURIComponent(encounterId.trim())}` : "";
    const response = await axios.get<IListEncountersResponse>(`${this.baseUrl}/Encounter${query}`);
    return response.data;
  }

  async getEncounterById(encounterId: string): Promise<IGetEncounterByIdResponse> {
    const response = await axios.get<IGetEncounterByIdResponse>(
      `${this.baseUrl}/Encounter/${encodeURIComponent(encounterId)}`
    );
    return response.data;
  }
}