import { atomWithStorage } from 'jotai/utils'

import type { Maybe } from '@/type'
import { parseStorageKey } from '@/utilities'

export type AuthState = {
  accessToken: Maybe<string>
}

const DEFAULT_AUTH_STATE: AuthState = {
  accessToken: null,
}

export const authAtom = atomWithStorage<AuthState>(parseStorageKey('auth'), DEFAULT_AUTH_STATE, undefined, {
  getOnInit: true,
})
