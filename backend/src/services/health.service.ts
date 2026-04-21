export interface HealthPayload {
  service: string;
  status: string;
  timestamp: string;
}

export function getHealthStatus(): HealthPayload {
  return {
    service: "backend",
    status: "ok",
    timestamp: new Date().toISOString()
  };
}
