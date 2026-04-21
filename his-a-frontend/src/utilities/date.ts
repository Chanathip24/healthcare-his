import dayjs, { Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'

import { DEFAULT_DATE_SLIDER } from '@/constant'

dayjs.extend(customParseFormat)
dayjs.extend(isToday)
dayjs.extend(isYesterday)

export const formatDate = (date: string, format: string = 'DD/MM/YYYY'): string => {
  if (!date) return 'N/A'
  return dayjs(date).format(format)
}

export const generateDate: () => Array<Dayjs> = (): Array<Dayjs> => {
  const currentDate: Dayjs = dayjs()

  return Array.from({ length: DEFAULT_DATE_SLIDER }, (_, index) => currentDate.add(index, 'day'))
}

//format time
//input 12:00:00 => output 12:00 AM
export const formatTime = (time: string): string => {
  if (!time) return 'N/A'
  return dayjs(time, 'HH:mm:ss').format('hh:mm A')
}

export const getToday = (format: string = 'dddd, DD MMMM YYYY'): string => {
  return dayjs().format(format)
}

export const formatDateLabel = (dateStr: string): string => {
  const d = dayjs(dateStr)
  if (d.isToday()) return 'Today'
  if (d.isYesterday()) return 'Yesterday'
  return d.format('D MMM YYYY')
}
