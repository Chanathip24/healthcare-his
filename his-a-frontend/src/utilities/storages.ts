export const parseStorageKey: (key: string, version?: string) => string = (key: string, version?: string): string => {
  if (version) return `${key}_${version}`
  return `${key}_0.1.0`
}
