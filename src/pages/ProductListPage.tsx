import { useState } from "react";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { SearchBar } from "../components/SearchBar";
import { ProductCard } from "../components/ProductCard";
import type { Product } from "../types";
import styles from "./ProductListPage.module.css";

type Props = {
  categoryId: number;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
};

export function ProductListPage({ categoryId, onBack, onAddToCart }: Props) {
  const [search, setSearch] = useState("");
  const products = useProducts(categoryId, search);

  const { categories } = useCategories();
  const categoryName = categories[categoryId as keyof typeof categories];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={onBack}
          aria-label="Go back"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className={styles.title}>{categoryName}</h1>
      </div>
      <SearchBar value={search} onChange={setSearch} />
      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={onAddToCart} />
        ))}
        {products.length === 0 && (
          <p className={styles.empty}>No products found.</p>
        )}
      </div>
    </div>
  );
}
