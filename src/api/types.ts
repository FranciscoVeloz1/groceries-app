export type PermissionRole = 'READ_ONLY' | 'ADMIN';

export type AppPermission = {
  applicationSlug: string;
  role: PermissionRole;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  permissions: AppPermission[];
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: {
    id: string;
    email: string;
    name: string;
  };
  accessToken: string;
  refreshToken: string;
};

export type RefreshRequest = {
  refreshToken: string;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

export type MeResponse = {
  user: AuthUser;
};

export type ApiErrorBody = {
  error: string;
  message: string;
  details?: unknown;
};

export type ApiProduct = {
  id: string;
  name: string;
  image: string;
  category: number;
  price: number;
  createdAt: string;
  updatedAt: string;
};

export type ApiTripItem = {
  id: string;
  productId: string | null;
  name: string;
  category: number;
  quantity: number;
  listPrice: number;
  realPrice: number | null;
  sortOrder: number;
};

export type ApiTrip = {
  id: string;
  status: 'DRAFT' | 'COMPLETED';
  notes: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: ApiTripItem[];
};

export type CreateProductBody = {
  name: string;
  image?: string;
  category: number;
  price: number;
};

export type PatchProductBody = {
  name?: string;
  image?: string;
  category?: number;
  price?: number;
};

export type TripItemInput = {
  productId?: string | null;
  name: string;
  category: number;
  quantity: number;
  listPrice: number;
  realPrice?: number | null;
  sortOrder?: number;
};

export type CreateTripBody = {
  notes?: string | null;
  items: TripItemInput[];
};

export type ReplaceTripItemsBody = {
  items: TripItemInput[];
};

export type PatchTripBody = {
  notes?: string | null;
};
