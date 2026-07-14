export const ROUTES = {
  CATEGORIES: '/',
  PRODUCTS: '/products/:categoryId',
  CART: '/cart',
  LOGIN: '/login',
  ADMIN: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_SHOPPING: '/admin/shopping',
  ADMIN_HISTORY: '/admin/history',
  ADMIN_HISTORY_TRIP: '/admin/history/:tripId',
  FORBIDDEN: '/forbidden'
} as const;
