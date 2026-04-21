import type { TVReturnType } from 'tailwind-variants'

type IVariantTransform<T> = T extends infer U
  ? {
      [K in keyof U]-?: U[K] extends string ? Record<U[K], string> : Record<'true' | 'false', string>
    }
  : never

export type ICompVariantConfig<T> = TVReturnType<
  IVariantTransform<T>,
  undefined,
  string,
  IVariantTransform<T>,
  undefined,
  undefined
>
