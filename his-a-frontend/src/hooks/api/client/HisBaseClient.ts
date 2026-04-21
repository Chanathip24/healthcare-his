import type { AxiosHeaders, AxiosInstance } from 'axios'
import axios from 'axios'

import { parseStorageKey } from '@/utilities'

export class HisBaseClient {
  readonly axiosInstance: AxiosInstance
  readonly axiosWithAuth: AxiosInstance

  constructor(baseUrl: string, headers?: AxiosHeaders) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers,
    })
    this.axiosWithAuth = axios.create({
      baseURL: baseUrl,
      headers,
    })

    this.axiosInstance.interceptors.request.use((config) => {
      return config
    })
    this.axiosInstance.interceptors.response.use((response) => {
      return response
    })

    this.axiosWithAuth.interceptors.request.use((config) => {
      // add auth token to headers
      const accessTokenString = localStorage.getItem(parseStorageKey('auth'))
      if (accessTokenString) {
        const { accessToken }: { accessToken: string } = JSON.parse(accessTokenString)
        config.headers.Authorization = `Bearer ${accessToken}`
      }
      return config
    })
    this.axiosWithAuth.interceptors.response.use((response) => {
      return response
    })
  }
}
