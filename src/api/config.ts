function normalizeApiBaseUrl(rawValue: string): string {
  const trimmed = rawValue.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(
      `VITE_API_BASE_URL must be an absolute URL (received "${rawValue}"). See .env.example.`
    );
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(
      `VITE_API_BASE_URL must use http or https (received "${rawValue}"). See .env.example.`
    );
  }

  return parsed.toString().replace(/\/$/, '');
}

export function getApiBaseUrl(): string {
  const rawValue = import.meta.env.VITE_API_BASE_URL;

  if (rawValue === undefined || rawValue === null) {
    throw new Error(
      'VITE_API_BASE_URL is missing. Copy .env.example to .env and set an absolute URL.'
    );
  }

  if (typeof rawValue !== 'string') {
    throw new Error('VITE_API_BASE_URL must be a string.');
  }

  return normalizeApiBaseUrl(rawValue);
}

/** Eager validation so misconfiguration fails at module load, not on first request. */
export const API_BASE_URL = getApiBaseUrl();

export const GROCERIES_APP_SLUG = 'groceries-app';
