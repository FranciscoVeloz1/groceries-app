import type { RequestOptions } from '../api/http';

type GroceriesApiSession = {
  userId: string;
  request: <T>(path: string, options?: Omit<RequestOptions, 'accessToken'>) => Promise<T>;
};

let session: GroceriesApiSession | null = null;

export function setGroceriesApiSession(next: GroceriesApiSession | null): void {
  session = next;
}

export function requireGroceriesApiSession(): GroceriesApiSession {
  if (!session) {
    throw new Error('Groceries API session is not available');
  }

  return session;
}
