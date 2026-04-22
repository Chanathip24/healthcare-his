import type { AxiosHeaders, AxiosInstance } from 'axios'
import axios from 'axios'

import { parseStorageKey } from '@/utilities'

export class HisBaseClient {
  readonly axiosInstance: AxiosInstance
  readonly axiosWithAuth: AxiosInstance

  constructor(baseUrl: string, headers?: AxiosHeaders) {
    const defaultHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(headers || {}),
    }

    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: defaultHeaders,
      timeout: 10_000,
    })
    this.axiosWithAuth = axios.create({
      baseURL: baseUrl,
      headers: defaultHeaders,
      timeout: 10_000,
    })

    this.axiosInstance.interceptors.request.use((config) => {
      return config
    })
    this.axiosInstance.interceptors.response.use((response) => {
      return response
    })

    this.axiosWithAuth.interceptors.request.use((config) => {
      // add auth token to headers if available
      const accessTokenString = localStorage.getItem(parseStorageKey('auth'))
      if (accessTokenString) {
        try {
          const { accessToken }: { accessToken?: string } = JSON.parse(accessTokenString)
          if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
          }
        } catch {
          localStorage.removeItem(parseStorageKey('auth'))
        }
      }
      return config
    })
    this.axiosWithAuth.interceptors.response.use((response) => {
      return response
    })
  }
}
