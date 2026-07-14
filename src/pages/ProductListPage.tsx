import { useState } from "react";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { SearchBar } from "../components/SearchBar";
import { ProductCard } from "../components/ProductCard";
import { CartBadge } from "../components/CartBadge";
import type { Product } from "../types";
import styles from "./ProductListPage.module.css";

type Props = {
  categoryId: number;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onAddCustom: (item: { name: string; quantity: number; price: number }) => void;
  cartCount: number;
  onCartClick: () => void;
};

export function ProductListPage({
  categoryId,
  onBack,
  onAddToCart,
  onAddCustom,
  cartCount,
  onCartClick,
}: Props) {
  const [search, setSearch] = useState("");
  const products = useProducts(categoryId, search);

  const { categories } = useCategories();
  const categoryName = categories[categoryId as keyof typeof categories];

  const [customName, setCustomName] = useState("");
  const [customQty, setCustomQty] = useState("1");
  const [customPrice, setCustomPrice] = useState("");

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customName.trim();
    const quantity = Number(customQty);
    const price = Number(customPrice);
    if (
      !trimmed ||
      Number.isNaN(quantity) ||
      quantity < 1 ||
      Number.isNaN(price) ||
      price < 0
    ) {
      return;
    }

    onAddCustom({ name: trimmed, quantity, price });
    setCustomName("");
    setCustomQty("1");
    setCustomPrice("");
  };

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
        <CartBadge count={cartCount} onClick={onCartClick} />
      </div>
      <SearchBar value={search} onChange={setSearch} />

      {categoryId === 5 && (
        <form className={styles.addForm} onSubmit={handleAddCustom}>
          <h2 className={styles.addFormTitle}>Add item manually</h2>
          <div className={styles.addFormFields}>
            <label className={styles.addField}>
              <span className={styles.addLabel}>Name</span>
              <input
                className={styles.addInput}
                type="text"
                placeholder="Product name"
                value={customName}
                onChange={(e) => {
                  setCustomName(e.target.value);
                }}
                required
              />
            </label>
            <label className={styles.addField}>
              <span className={styles.addLabel}>Quantity</span>
              <input
                className={styles.addInput}
                type="number"
                placeholder="1"
                min={1}
                value={customQty}
                onChange={(e) => {
                  setCustomQty(e.target.value);
                }}
                required
              />
            </label>
            <label className={styles.addField}>
              <span className={styles.addLabel}>Unit price</span>
              <input
                className={styles.addInput}
                type="number"
                placeholder="0.00"
                min={0}
                step={0.01}
                value={customPrice}
                onChange={(e) => {
                  setCustomPrice(e.target.value);
                }}
                required
              />
            </label>
          </div>
          <button className={styles.addBtn} type="submit">
            Add
          </button>
        </form>
      )}

      <div className={styles.grid}>
        {products.map((product) => {
          return (
            <ProductCard key={product.id} product={product} onAdd={onAddToCart} />
          );
        })}
        {products.length === 0 ? (
          <p className={styles.empty}>No products found.</p>
        ) : null}
      </div>
    </div>
  );
}
