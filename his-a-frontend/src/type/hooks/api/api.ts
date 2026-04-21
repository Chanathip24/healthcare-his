import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'

// [BASE FOR HOOK]
export type IBaseUseMutation<TData, TVariables> = UseMutationResult<TData, Error, TVariables>

export type IBaseUseQueryResult<T> = UseQueryResult<T, Error>

export type IBasePaginateQueryResult<T> = Omit<UseQueryResult<T, Error>, 'data'> & Required<T>

//error
export type IHisApiClientErrorResponse = IHisApiClientBaseResponse<null>

export type IPaginate = {
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

// [DATA RESPONSE STRUCTURE]
export type IHisApiClientBaseResponse<T> = {
  success: boolean
  message: string
  data: T
  timestamp: string
}

// [BASE FOR RESPONSE]
export type IHisApiClientBasePaginateResponse<T> = IHisApiClientBaseResponse<{
  data: Array<T>
  pagination: IPaginate
}>

// [ERROR]
export type IHisApiClientBaseError = IHisApiClientBaseResponse<null>
