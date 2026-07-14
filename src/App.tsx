import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAdmin } from './auth/RequireAdmin';
import { ROUTES } from './config/routes';
import { AdminHistoryPage } from './pages/AdminHistoryPage';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { AdminShoppingPage } from './pages/AdminShoppingPage';
import { CartPage } from './pages/CartPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { LoginPage } from './pages/LoginPage';
import { ProductListPage } from './pages/ProductListPage';

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
      <Route path={ROUTES.PRODUCTS} element={<ProductListPage />} />
      <Route path={ROUTES.CART} element={<CartPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.ADMIN} element={<Navigate to={ROUTES.ADMIN_PRODUCTS} replace />} />
      <Route
        path={ROUTES.ADMIN_PRODUCTS}
        element={
          <RequireAdmin>
            <AdminProductsPage />
          </RequireAdmin>
        }
      />
      <Route
        path={ROUTES.ADMIN_SHOPPING}
        element={
          <RequireAdmin>
            <AdminShoppingPage />
          </RequireAdmin>
        }
      />
      <Route
        path={ROUTES.ADMIN_HISTORY}
        element={
          <RequireAdmin>
            <AdminHistoryPage />
          </RequireAdmin>
        }
      />
      <Route
        path={ROUTES.ADMIN_HISTORY_TRIP}
        element={
          <RequireAdmin>
            <AdminHistoryPage />
          </RequireAdmin>
        }
      />
      <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
      <Route path="*" element={<Navigate to={ROUTES.CATEGORIES} replace />} />
    </Routes>
  );
}
