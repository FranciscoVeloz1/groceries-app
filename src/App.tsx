import { useCallback, useState } from 'react';
import type { AdminPage } from './components/AdminNav';
import { useAuth } from './auth/AuthProvider';
import { useCart } from './hooks/useCart';
import { useAdminTrips } from './hooks/useAdminTrips';
import { AdminHistoryPage } from './pages/AdminHistoryPage';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { AdminShoppingPage } from './pages/AdminShoppingPage';
import { CartPage } from './pages/CartPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { LoginPage } from './pages/LoginPage';
import { ProductListPage } from './pages/ProductListPage';

type View =
  | { page: 'categories' }
  | { page: 'products'; categoryId: number }
  | { page: 'cart' }
  | { page: 'login' }
  | { page: 'admin-products' }
  | { page: 'admin-shopping' }
  | { page: 'admin-history'; tripId?: string };

const App = () => {
  const cart = useCart();
  const { logout, isGroceriesAdmin, status } = useAuth();
  const trips = useAdminTrips();
  const [view, setView] = useState<View>({ page: 'categories' });
  const [prevView, setPrevView] = useState<View>({ page: 'categories' });
  const [startingTrip, setStartingTrip] = useState(false);

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

  const startShoppingFromCart = useCallback(async () => {
    setStartingTrip(true);
    try {
      await trips.createFromCartItems(cart.items);
      cart.clearCart();
      setView({ page: 'admin-shopping' });
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : 'No se pudo iniciar el mandado';
      window.alert(message);
    } finally {
      setStartingTrip(false);
    }
  }, [cart, trips]);

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

  if (view.page === 'admin-shopping') {
    if (!isGroceriesAdmin) {
      return (
        <LoginPage
          onBack={() => {
            setView({ page: 'categories' });
          }}
          onSuccessAdmin={() => {
            setView({ page: 'admin-shopping' });
          }}
        />
      );
    }

    return (
      <AdminShoppingPage
        onNavigate={handleAdminNavigate}
        onLogout={() => {
          void handleLogout();
        }}
        onBrowseCatalog={browseCatalog}
        onCompleted={(tripId) => {
          setView({ page: 'admin-history', tripId });
        }}
      />
    );
  }

  if (view.page === 'admin-history') {
    if (!isGroceriesAdmin) {
      return (
        <LoginPage
          onBack={() => {
            setView({ page: 'categories' });
          }}
          onSuccessAdmin={() => {
            setView({ page: 'admin-history' });
          }}
        />
      );
    }

    return (
      <AdminHistoryPage
        onNavigate={handleAdminNavigate}
        onLogout={() => {
          void handleLogout();
        }}
        onBrowseCatalog={browseCatalog}
        initialTripId={view.tripId ?? null}
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
        isGroceriesAdmin={isGroceriesAdmin}
        onStartAdminShopping={() => {
          void startShoppingFromCart();
        }}
        startingAdminShopping={startingTrip}
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
