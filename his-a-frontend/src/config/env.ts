export const IS_DEV: boolean = import.meta.env.DEV // default from vite, no need to define in env

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:3000'
export const HOSPITAL_NAME: string = import.meta.env.VITE_HOSPITAL_NAME?.trim() || 'Community General Hospital'
