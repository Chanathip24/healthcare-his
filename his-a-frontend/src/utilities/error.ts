import type { AxiosError } from 'axios'

import type { IHisApiClientBaseError } from '@/type'

export const getErrorMessage = (error: unknown, errorMessage?: string): string => {
  switch (typeof error) {
    case 'string': {
      return error
    }
    case 'object': {
      // if backend error
      const backendError: AxiosError<IHisApiClientBaseError> = error as AxiosError<IHisApiClientBaseError>
      if (backendError.response?.data) {
        return backendError.response.data.message
      }
      // if general error
      if (error instanceof Error) {
        return error.message
      }
      //  if an object error, stringify whole object out
      return JSON.stringify(error)
    }
    default: {
      return errorMessage || 'Something went wrong'
    }
  }
}
