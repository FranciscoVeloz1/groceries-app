import type { Product } from "../../types";

import styles from "./ProductCard.module.css";

type Props = {
  product: Product;
  onAdd: (product: Product) => void;
};

export function ProductCard({ product, onAdd }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={`${import.meta.env.BASE_URL}images/${product.image}`}
          alt={product.name}
          className={styles.image}
        />
      </div>

      <span className={styles.name}>{product.name}</span>

      <div className={styles.footer}>
        <span className={styles.price}>${product.price.toFixed(2)}</span>

        <button
          className={styles.addBtn}
          onClick={() => onAdd(product)}
          aria-label={`Add ${product.name} to cart`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
