import { useState } from "react";
import { CategoriesPage } from "./pages/CategoriesPage";
import { ProductListPage } from "./pages/ProductListPage";
import type { Product } from "./types";

type View = { page: "categories" } | { page: "products"; categoryId: number };

const App = () => {
  const [view, setView] = useState<View>({ page: "categories" });

  const handleAddToCart = (_product: Product) => {
    // Cart functionality will be added in Phase 4
  };

  if (view.page === "products") {
    return (
      <ProductListPage
        categoryId={view.categoryId}
        onBack={() => setView({ page: "categories" })}
        onAddToCart={handleAddToCart}
      />
    );
  }

  return (
    <CategoriesPage
      onSelectCategory={(categoryId) =>
        setView({ page: "products", categoryId })
      }
    />
  );
};

export default App;
