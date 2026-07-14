import { requireGroceriesApiSession } from '../auth/groceries-api-session';
import type {
  ApiProduct,
  ApiTrip,
  CreateProductBody,
  CreateTripBody,
  PatchProductBody,
  PatchTripBody,
  ReplaceTripItemsBody
} from './types';

export async function listProducts(category?: number): Promise<ApiProduct[]> {
  const session = requireGroceriesApiSession();
  const query =
    category === undefined ? '' : `?category=${encodeURIComponent(String(category))}`;
  const response = await session.request<{ products: ApiProduct[] }>(
    `/api/v1/groceries/products${query}`
  );
  return response.products;
}

export async function createProduct(body: CreateProductBody): Promise<ApiProduct> {
  const session = requireGroceriesApiSession();
  const response = await session.request<{ product: ApiProduct }>('/api/v1/groceries/products', {
    method: 'POST',
    body
  });
  return response.product;
}

export async function getProduct(id: string): Promise<ApiProduct> {
  const session = requireGroceriesApiSession();
  const response = await session.request<{ product: ApiProduct }>(
    `/api/v1/groceries/products/${id}`
  );
  return response.product;
}

export async function updateProduct(id: string, body: PatchProductBody): Promise<ApiProduct> {
  const session = requireGroceriesApiSession();
  const response = await session.request<{ product: ApiProduct }>(
    `/api/v1/groceries/products/${id}`,
    {
      method: 'PATCH',
      body
    }
  );
  return response.product;
}

export async function deleteProduct(id: string): Promise<void> {
  const session = requireGroceriesApiSession();
  await session.request<void>(`/api/v1/groceries/products/${id}`, {
    method: 'DELETE'
  });
}

export async function listTrips(status?: 'DRAFT' | 'COMPLETED'): Promise<ApiTrip[]> {
  const session = requireGroceriesApiSession();
  const query = status === undefined ? '' : `?status=${encodeURIComponent(status)}`;
  const response = await session.request<{ trips: ApiTrip[] }>(`/api/v1/groceries/trips${query}`);
  return response.trips;
}

export async function createTrip(body: CreateTripBody): Promise<ApiTrip> {
  const session = requireGroceriesApiSession();
  const response = await session.request<{ trip: ApiTrip }>('/api/v1/groceries/trips', {
    method: 'POST',
    body
  });
  return response.trip;
}

export async function getTrip(id: string): Promise<ApiTrip> {
  const session = requireGroceriesApiSession();
  const response = await session.request<{ trip: ApiTrip }>(`/api/v1/groceries/trips/${id}`);
  return response.trip;
}

export async function patchTrip(id: string, body: PatchTripBody): Promise<ApiTrip> {
  const session = requireGroceriesApiSession();
  const response = await session.request<{ trip: ApiTrip }>(`/api/v1/groceries/trips/${id}`, {
    method: 'PATCH',
    body
  });
  return response.trip;
}

export async function replaceTripItems(id: string, body: ReplaceTripItemsBody): Promise<ApiTrip> {
  const session = requireGroceriesApiSession();
  const response = await session.request<{ trip: ApiTrip }>(
    `/api/v1/groceries/trips/${id}/items`,
    {
      method: 'PUT',
      body
    }
  );
  return response.trip;
}

export async function completeTrip(id: string): Promise<ApiTrip> {
  const session = requireGroceriesApiSession();
  const response = await session.request<{ trip: ApiTrip }>(
    `/api/v1/groceries/trips/${id}/complete`,
    {
      method: 'POST'
    }
  );
  return response.trip;
}

export async function deleteTrip(id: string): Promise<void> {
  const session = requireGroceriesApiSession();
  await session.request<void>(`/api/v1/groceries/trips/${id}`, {
    method: 'DELETE'
  });
}
