import { useState } from "react";
import { CategoriesPage } from "./pages/CategoriesPage";
import { ProductListPage } from "./pages/ProductListPage";
import { CartPage } from "./pages/CartPage";
import { useCart } from "./hooks/useCart";

type View =
  | { page: "categories" }
  | { page: "products"; categoryId: number }
  | { page: "cart" };

const App = () => {
  const cart = useCart();
  const [view, setView] = useState<View>({ page: "categories" });
  const [prevView, setPrevView] = useState<View>({ page: "categories" });

  const goToCart = () => {
    setPrevView(view);
    setView({ page: "cart" });
  };

  if (view.page === "cart") {
    return (
      <CartPage
        items={cart.items}
        totalPrice={cart.totalPrice}
        onBack={() => setView(prevView)}
        onUpdateQuantity={cart.updateQuantity}
        onRemove={cart.removeFromCart}
        onClear={cart.clearCart}
        onImport={cart.importCart}
      />
    );
  }

  if (view.page === "products") {
    return (
      <ProductListPage
        categoryId={view.categoryId}
        onBack={() => setView({ page: "categories" })}
        onAddToCart={cart.addToCart}
        onAddCustom={cart.addCustomItem}
        cartCount={cart.totalItems}
        onCartClick={goToCart}
      />
    );
  }

  return (
    <CategoriesPage
      onSelectCategory={(categoryId) =>
        setView({ page: "products", categoryId })
      }
      cartCount={cart.totalItems}
      onCartClick={goToCart}
    />
  );
};

export default App;
