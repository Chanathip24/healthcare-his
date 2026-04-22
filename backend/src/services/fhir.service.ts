import { FHIR_SERVER_URL } from "@/configs";
import { HttpError } from "@/models/errors";

type FhirResource = Record<string, unknown>;

interface FhirBundleLink {
  relation: string;
  url: string;
}

interface FhirBundle {
  total: number;
  entries: FhirResource[];
  links: FhirBundleLink[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function toBaseUrl(): string {
  return FHIR_SERVER_URL.replace(/\/+$/, "");
}

function buildUrl(path: string): string {
  const normalizedPath: string = path.startsWith("/") ? path.slice(1) : path;
  return `${toBaseUrl()}/${normalizedPath}`;
}

function buildSearchUrl(resourceType: string, params: Record<string, string>): string {
  const searchParams: URLSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (!value) continue;
    searchParams.set(key, value);
  }

  const queryString: string = searchParams.toString();
  return queryString ? buildUrl(`${resourceType}?${queryString}`) : buildUrl(resourceType);
}

function extractOperationOutcomeMessage(payload: unknown): string | undefined {
  if (!isRecord(payload)) return undefined;
  const issue = payload.issue;
  if (!Array.isArray(issue) || issue.length === 0) return undefined;

  for (const issueItem of issue) {
    if (!isRecord(issueItem)) continue;

    const diagnostics: string | undefined = asString(issueItem.diagnostics);
    if (diagnostics) return diagnostics;

    const details = issueItem.details;
    if (!isRecord(details)) continue;
    const text: string | undefined = asString(details.text);
    if (text) return text;
  }

  return undefined;
}

function parseBundle(payload: unknown): FhirBundle {
  if (!isRecord(payload)) {
    throw new HttpError(502, "FHIR server returned an invalid response.");
  }

  const entry = payload.entry;
  const entries: FhirResource[] = [];
  if (Array.isArray(entry)) {
    for (const item of entry) {
      if (!isRecord(item)) continue;
      const resource = item.resource;
      if (isRecord(resource)) {
        entries.push(resource);
      }
    }
  }

  const link = payload.link;
  const links: FhirBundleLink[] = [];
  if (Array.isArray(link)) {
    for (const item of link) {
      if (!isRecord(item)) continue;
      const relation: string | undefined = asString(item.relation);
      const url: string | undefined = asString(item.url);
      if (relation && url) {
        links.push({ relation, url });
      }
    }
  }

  return {
    total: asNumber(payload.total) || 0,
    entries,
    links
  };
}

async function parseJson(response: Response): Promise<unknown> {
  const text: string = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function requestJson(url: string, init?: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/fhir+json, application/json",
        ...(init?.headers || {})
      }
    });
  } catch {
    throw new HttpError(502, "Unable to connect to FHIR server.");
  }

  const payload: unknown = await parseJson(response);
  if (response.ok) return payload;

  const message: string =
    extractOperationOutcomeMessage(payload) || `FHIR request failed with status ${response.status}.`;

  if (response.status === 404) {
    throw new HttpError(404, message);
  }

  if (response.status >= 400 && response.status < 500) {
    throw new HttpError(response.status, message);
  }

  throw new HttpError(502, message);
}

function extractLocationResourceId(location: string): { resourceType: string; id: string } | null {
  const cleaned: string = location.trim();
  const match: RegExpMatchArray | null = cleaned.match(/\/([A-Za-z]+)\/([^/]+)\/_history\/[^/]+$/);
  if (match && match[1] && match[2]) {
    return {
      resourceType: match[1],
      id: match[2]
    };
  }

  const fallbackMatch: RegExpMatchArray | null = cleaned.match(/\/([A-Za-z]+)\/([^/]+)$/);
  if (fallbackMatch && fallbackMatch[1] && fallbackMatch[2]) {
    return {
      resourceType: fallbackMatch[1],
      id: fallbackMatch[2]
    };
  }

  return null;
}

export async function readFhirResource(resourceType: string, id: string): Promise<FhirResource> {
  const payload: unknown = await requestJson(buildUrl(`${resourceType}/${encodeURIComponent(id)}`));
  if (!isRecord(payload)) {
    throw new HttpError(502, `FHIR server returned invalid ${resourceType} response.`);
  }

  return payload;
}

export async function createFhirResource(resourceType: string, resource: FhirResource): Promise<FhirResource> {
  let response: Response;
  try {
    response = await fetch(buildUrl(resourceType), {
      method: "POST",
      headers: {
        Accept: "application/fhir+json, application/json",
        "Content-Type": "application/fhir+json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(resource)
    });
  } catch {
    throw new HttpError(502, "Unable to connect to FHIR server.");
  }

  const payload: unknown = await parseJson(response);

  if (response.ok && isRecord(payload)) {
    return payload;
  }

  if (!response.ok) {
    const message: string =
      extractOperationOutcomeMessage(payload) || `FHIR create request failed with status ${response.status}.`;

    if (response.status >= 400 && response.status < 500) {
      throw new HttpError(response.status, message);
    }

    throw new HttpError(502, message);
  }

  const locationHeader: string | null = response.headers.get("location");
  if (locationHeader) {
    const extracted = extractLocationResourceId(locationHeader);
    if (extracted && extracted.resourceType.toLowerCase() === resourceType.toLowerCase()) {
      return readFhirResource(extracted.resourceType, extracted.id);
    }
  }

  throw new HttpError(502, "FHIR server did not return created resource representation.");
}

export async function searchFhirResources(
  resourceType: string,
  params: Record<string, string> = {}
): Promise<FhirResource[]> {
  const resources: FhirResource[] = [];
  let nextUrl: string | null = buildSearchUrl(resourceType, params);
  let guard: number = 0;

  while (nextUrl) {
    guard += 1;
    if (guard > 50) {
      throw new HttpError(502, "FHIR paging exceeded safe limit.");
    }

    const payload: unknown = await requestJson(nextUrl);
    const bundle: FhirBundle = parseBundle(payload);
    resources.push(...bundle.entries);

    const nextLink: FhirBundleLink | undefined = bundle.links.find(
      (link: FhirBundleLink): boolean => link.relation === "next"
    );
    nextUrl = nextLink?.url || null;
  }

  return resources;
}

export async function countFhirResources(resourceType: string, params: Record<string, string> = {}): Promise<number> {
  const payload: unknown = await requestJson(
    buildSearchUrl(resourceType, {
      ...params,
      _summary: "count"
    })
  );

  const bundle: FhirBundle = parseBundle(payload);
  return bundle.total;
}
