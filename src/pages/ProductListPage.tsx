import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCart } from '../hooks/useCart';
import { ROUTES } from '../config/routes';
import { SearchBar } from '../components/SearchBar';
import { ProductCard } from '../components/ProductCard';
import { CartBadge } from '../components/CartBadge';
import styles from './ProductListPage.module.css';

export function ProductListPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const id = Number(categoryId);
  const [search, setSearch] = useState('');
  const products = useProducts(id, search);
  const { categories } = useCategories();
  const { addToCart, addCustomItem, totalItems } = useCart();
  const navigate = useNavigate();

  const categoryName = categories[id as keyof typeof categories];

  const [customName, setCustomName] = useState('');
  const [customQty, setCustomQty] = useState(1);
  const [customPrice, setCustomPrice] = useState(0);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customName.trim();
    if (!trimmed || customQty < 1 || customPrice < 0) return;
    addCustomItem({ name: trimmed, quantity: customQty, price: customPrice });
    setCustomName('');
    setCustomQty(1);
    setCustomPrice(0);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => navigate(ROUTES.CATEGORIES)}
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
        <CartBadge count={totalItems} onClick={() => navigate(ROUTES.CART)} />
      </div>
      <SearchBar value={search} onChange={setSearch} />

      {id === 5 && (
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
                onChange={(e) => setCustomName(e.target.value)}
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
                onChange={(e) => setCustomQty(Number(e.target.value))}
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
                onChange={(e) => setCustomPrice(Number(e.target.value))}
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
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={addToCart} />
        ))}
        {products.length === 0 && <p className={styles.empty}>No products found.</p>}
      </div>
    </div>
  );
}
