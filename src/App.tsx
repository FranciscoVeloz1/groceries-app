import { useCallback, useState } from 'react';
import type { AdminPage } from './components/AdminNav';
import { AdminNav } from './components/AdminNav';
import { useAuth } from './auth/AuthProvider';
import { useCart } from './hooks/useCart';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { CartPage } from './pages/CartPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { LoginPage } from './pages/LoginPage';
import { ProductListPage } from './pages/ProductListPage';
import styles from './pages/AdminProductsPage.module.css';

type View =
  | { page: 'categories' }
  | { page: 'products'; categoryId: number }
  | { page: 'cart' }
  | { page: 'login' }
  | { page: 'admin-products' }
  | { page: 'admin-shopping' }
  | { page: 'admin-history' };

function AdminPlaceholder({
  title,
  active,
  onNavigate,
  onLogout,
  onBrowseCatalog
}: {
  title: string;
  active: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
  onBrowseCatalog: () => void;
}) {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      <AdminNav
        active={active}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onBrowseCatalog={onBrowseCatalog}
      />
      <p className={styles.status}>Coming in next task</p>
    </div>
  );
}

const App = () => {
  const cart = useCart();
  const { logout, isGroceriesAdmin, status } = useAuth();
  const [view, setView] = useState<View>({ page: 'categories' });
  const [prevView, setPrevView] = useState<View>({ page: 'categories' });

  const goToCart = () => {
    setPrevView(view);
    setView({ page: 'cart' });
  };

  const handleLogout = useCallback(async () => {
    await logout();
    setView({ page: 'categories' });
  }, [logout]);

  const handleAdminNavigate = useCallback((page: AdminPage) => {
    setView({ page });
  }, []);

  const browseCatalog = useCallback(() => {
    setView({ page: 'categories' });
  }, []);

  if (view.page === 'login') {
    return (
      <LoginPage
        onBack={() => {
          setView({ page: 'categories' });
        }}
        onSuccessAdmin={() => {
          setView({ page: 'admin-products' });
        }}
      />
    );
  }

  if (view.page === 'admin-products') {
    if (!isGroceriesAdmin) {
      return (
        <LoginPage
          onBack={() => {
            setView({ page: 'categories' });
          }}
          onSuccessAdmin={() => {
            setView({ page: 'admin-products' });
          }}
        />
      );
    }

    return (
      <AdminProductsPage
        onNavigate={handleAdminNavigate}
        onLogout={() => {
          void handleLogout();
        }}
        onBrowseCatalog={browseCatalog}
      />
    );
  }

  if (view.page === 'admin-shopping' || view.page === 'admin-history') {
    if (!isGroceriesAdmin) {
      return (
        <LoginPage
          onBack={() => {
            setView({ page: 'categories' });
          }}
          onSuccessAdmin={() => {
            setView({ page: view.page });
          }}
        />
      );
    }

    return (
      <AdminPlaceholder
        title={view.page === 'admin-shopping' ? 'Compra' : 'Historial'}
        active={view.page}
        onNavigate={handleAdminNavigate}
        onLogout={() => {
          void handleLogout();
        }}
        onBrowseCatalog={browseCatalog}
      />
    );
  }

  if (view.page === 'cart') {
    return (
      <CartPage
        items={cart.items}
        totalPrice={cart.totalPrice}
        onBack={() => {
          setView(prevView);
        }}
        onUpdateQuantity={cart.updateQuantity}
        onRemove={cart.removeFromCart}
        onClear={cart.clearCart}
        onImport={cart.importCart}
      />
    );
  }

  if (view.page === 'products') {
    return (
      <ProductListPage
        categoryId={view.categoryId}
        onBack={() => {
          setView({ page: 'categories' });
        }}
        onAddToCart={cart.addToCart}
        onAddCustom={cart.addCustomItem}
        cartCount={cart.totalItems}
        onCartClick={goToCart}
      />
    );
  }

  return (
    <CategoriesPage
      onSelectCategory={(categoryId) => {
        setView({ page: 'products', categoryId });
      }}
      cartCount={cart.totalItems}
      onCartClick={goToCart}
      authStatus={status}
      isGroceriesAdmin={isGroceriesAdmin}
      onAdminClick={() => {
        setView({ page: isGroceriesAdmin ? 'admin-products' : 'login' });
      }}
      onLogout={() => {
        void handleLogout();
      }}
    />
  );
};

export default App;
