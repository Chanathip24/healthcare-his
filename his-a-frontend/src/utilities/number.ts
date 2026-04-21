export function formatNumber(value: number, decimalPlaces: number = 0, useThousandsSeparator: boolean = true): string {
  if (isNaN(value)) return '0'

  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    useGrouping: useThousandsSeparator,
  }

  return value.toLocaleString(undefined, options)
}

export function formatCurrency(value: number, decimalPlaces: number = 2, currencySymbol: string = '฿'): string {
  if (isNaN(value)) return '0'
  if (value === 0) return 'Free'
  return `${currencySymbol}${formatNumber(value, decimalPlaces)}`
}

export function formatDuration(totalHours: number): string {
  if (!totalHours) return 'N/A'
  const hours: number = Math.floor(totalHours)
  return `${hours}h `
}

export function formatNumberWithSuffix(value: number): string {
  if (Math.abs(value) < 1000) return value.toString()

  const units = ['k', 'M', 'B', 'T']
  const sign = value < 0 ? '-' : ''
  let num = Math.abs(value)
  let unitIndex = -1

  while (num >= 1000 && unitIndex < units.length - 1) {
    num /= 1000
    unitIndex++
  }

  // Remove trailing .0
  const formatted = num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)

  return `${sign}${formatted}${units[unitIndex]}`
}
