const SESSION_KEY = 'groceries-app:auth:v1';

export type StoredSession = {
  refreshToken: string;
};

export function readRefreshToken(): string | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as StoredSession).refreshToken !== 'string' ||
      (parsed as StoredSession).refreshToken.trim() === ''
    ) {
      return null;
    }

    return (parsed as StoredSession).refreshToken;
  } catch {
    return null;
  }
}

export function writeRefreshToken(refreshToken: string): void {
  try {
    const payload: StoredSession = { refreshToken };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch {
    // Storage may be unavailable (private mode / quota). Continue in-memory only.
  }
}

export function clearRefreshToken(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage failures while clearing.
  }
}

export const SESSION_STORAGE_KEY = SESSION_KEY;
