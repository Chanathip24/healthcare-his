const DEFAULT_ALLOWED_ORIGINS: string[] = ["http://localhost:5173", "http://127.0.0.1:5173"];

function parseNumberEnv(value: string | undefined, fallback: number, min: number, max: number): number {
  if (!value) return fallback;
  const parsed: number = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function parseAllowedOrigins(value: string | undefined): string[] {
  if (!value) return DEFAULT_ALLOWED_ORIGINS;
  const origins: string[] = value
    .split(",")
    .map((origin: string): string => origin.trim())
    .filter((origin: string): boolean => origin.length > 0);
  return origins.length > 0 ? Array.from(new Set(origins)) : DEFAULT_ALLOWED_ORIGINS;
}

function parseBodyLimit(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const normalizedValue: string = value.trim().toLowerCase();
  return /^\d+(b|kb|mb)$/.test(normalizedValue) ? normalizedValue : fallback;
}

export const SERVER_PORT: number = parseNumberEnv(process.env.SERVER_PORT, 3000, 1, 65535);
export const FHIR_SERVER_URL: string = process.env.FHIR_SERVER_URL || "http://localhost:8090/fhir";
export const ALLOWED_ORIGINS: string[] = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);
export const RATE_LIMIT_WINDOW_MS: number = parseNumberEnv(process.env.RATE_LIMIT_WINDOW_MS, 60_000, 1_000, 900_000);
export const RATE_LIMIT_MAX_REQUESTS: number = parseNumberEnv(process.env.RATE_LIMIT_MAX_REQUESTS, 120, 10, 5_000);
export const JSON_BODY_LIMIT: string = parseBodyLimit(process.env.JSON_BODY_LIMIT, "32kb");
export const NODE_ENV: string = process.env.NODE_ENV || "development";
export const IS_PRODUCTION: boolean = NODE_ENV === "production";
