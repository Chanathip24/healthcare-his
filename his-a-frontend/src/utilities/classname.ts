import { cn as tvCN, type CnOptions, type CnReturn, type CreateTV, createTV } from 'tailwind-variants'
import type { TWMConfig } from 'tailwind-variants/dist/config.js'

// default config
const twMergeConfig: TWMConfig['twMergeConfig'] = {
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [{ header: ['1', '2', '3', '4', '5', '6'], body: ['1', '2', '3'] }],
        },
      ],
    },
  },
}
// NOTE: use this `tv` only, do not use `tv` from lib
export const tv: CreateTV = createTV({ twMerge: true, twMergeConfig: twMergeConfig })

// NOTE: use this `cn` only, do not use `cn` from lib
export const cn: (...classes: CnOptions) => CnReturn = (...classes: CnOptions) => {
  return tvCN(classes)({ twMerge: true, twMergeConfig })
}
