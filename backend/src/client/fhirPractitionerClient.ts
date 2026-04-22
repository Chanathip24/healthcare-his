import axios from "axios";
import {
  ICreatePractitionerPayload,
  ICreatePractitionerResponse,
  IGetPractitionerByIdResponse,
  IListPractitionersResponse
} from "@/types/services";

export class FhirPractitionerClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async listPractitioners(): Promise<IListPractitionersResponse> {
    const response = await axios.get<IListPractitionersResponse>(`${this.baseUrl}/Practitioner`);
    return response.data;
  }

  async getPractitionerById(id: string): Promise<IGetPractitionerByIdResponse> {
    const response = await axios.get<IGetPractitionerByIdResponse>(
      `${this.baseUrl}/Practitioner/${encodeURIComponent(id)}`
    );
    return response.data;
  }

  async createPractitioner(payload: ICreatePractitionerPayload): Promise<ICreatePractitionerResponse> {
    const response = await axios.post<ICreatePractitionerResponse>(`${this.baseUrl}/Practitioner`, payload);
    return response.data;
  }
}
