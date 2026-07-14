import { API_BASE_URL } from './config';
import type { ApiErrorBody } from './types';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, message: string, code = 'REQUEST_FAILED', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export type RequestOptions = {
  method?: string;
  body?: unknown;
  accessToken?: string;
  signal?: AbortSignal;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toApiErrorBody(value: unknown): ApiErrorBody | null {
  if (!isRecord(value)) {
    return null;
  }

  const error = value.error;
  const message = value.message;

  if (typeof error !== 'string' || typeof message !== 'string') {
    return null;
  }

  return {
    error,
    message,
    details: value.details
  };
}

function toNetworkError(caught: unknown): ApiError {
  if (caught instanceof ApiError) {
    return caught;
  }

  if (caught instanceof Error && caught.message.trim() !== '') {
    return new ApiError(0, caught.message, 'NETWORK_ERROR');
  }

  return new ApiError(0, 'Network request failed', 'NETWORK_ERROR');
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.trim() === '') {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers();
  const hasBody = options.body !== undefined;

  if (hasBody) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.accessToken) {
    headers.set('Authorization', `Bearer ${options.accessToken}`);
  }

  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? (hasBody ? 'POST' : 'GET'),
      headers,
      body: hasBody ? JSON.stringify(options.body) : undefined,
      signal: options.signal
    });
  } catch (caught) {
    throw toNetworkError(caught);
  }

  const parsed = await parseBody(response);

  if (!response.ok) {
    const apiBody = toApiErrorBody(parsed);
    if (apiBody) {
      throw new ApiError(response.status, apiBody.message, apiBody.error, apiBody.details);
    }

    throw new ApiError(response.status, `Request failed with status ${response.status}`);
  }

  return parsed as T;
}
