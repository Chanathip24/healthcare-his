export const SERVER_PORT: number = Number(process.env.SERVER_PORT) || 3000;
export const FHIR_SERVER_URL: string = process.env.FHIR_SERVER_URL || "http://localhost:8090/fhir";

function parseAllowedOrigins(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((origin: string): string => origin.trim())
    .filter((origin: string): boolean => origin.length > 0);
}

export const ALLOWED_ORIGINS: string[] = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);