import { useRef } from "react";
import type { CartItem } from "../hooks/useCart";
import { useCategories } from "../hooks/useCategories";
import { exportToExcel } from "../utils/exportToExcel";
import { exportToJson } from "../utils/exportToJson";
import { parseGroceryList } from "../utils/groceryList";
import styles from "./CartPage.module.css";

type Props = {
  items: CartItem[];
  totalPrice: number;
  onBack: () => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  onClear: () => void;
  onImport: (items: CartItem[]) => void;
};

export function CartPage({
  items,
  totalPrice,
  onBack,
  onUpdateQuantity,
  onRemove,
  onClear,
  onImport,
}: Props) {
  const { categories } = useCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const raw = await file.text();
      const parsed = parseGroceryList(raw);
      onImport(parsed);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to import file.");
    }

    e.target.value = "";
  };

  const grouped = new Map<number, CartItem[]>();
  for (const item of items) {
    const cat = item.product.category;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(item);
  }

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
        <h1 className={styles.title}>Cart</h1>
        <div className={styles.headerActions}>
          <button className={styles.importBtn} onClick={handleImportClick}>
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            hidden
          />
          {items.length > 0 && (
            <button className={styles.clearBtn} onClick={onClear}>
              Clear
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>Your cart is empty.</p>
      ) : (
        <>
          <div className={styles.list}>
            {Array.from(grouped.entries()).map(([catId, catItems]) => (
              <div key={catId} className={styles.group}>
                <h2 className={styles.categoryName}>
                  {categories[catId as keyof typeof categories]}
                </h2>
                {catItems.map((item) => (
                  <div key={item.product.id} className={styles.item}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>
                        {item.product.name}
                      </span>
                      <span className={styles.itemPrice}>
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.controls}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() =>
                          onUpdateQuantity(
                            item.product.id,
                            item.quantity - 1,
                          )
                        }
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className={styles.qty}>{item.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() =>
                          onUpdateQuantity(
                            item.product.id,
                            item.quantity + 1,
                          )
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                      <button
                        className={styles.removeBtn}
                        onClick={() => onRemove(item.product.id)}
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <div className={styles.total}>
              <span>Total</span>
              <span className={styles.totalPrice}>
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <div className={styles.exportActions}>
              <button
                className={styles.exportBtn}
                onClick={() => exportToExcel(items)}
              >
                Export Excel
              </button>
              <button
                className={styles.exportBtnSecondary}
                onClick={() => exportToJson(items)}
              >
                Export JSON
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
