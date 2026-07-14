import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useCart } from '../hooks/useCart';
import { useCategories } from '../hooks/useCategories';
import { ROUTES } from '../config/routes';
import { SearchBar } from '../components/SearchBar';
import { CategoryCard } from '../components/CategoryCard';
import { CartBadge } from '../components/CartBadge';
import styles from './CategoriesPage.module.css';

export function CategoriesPage() {
  const { entries } = useCategories();
  const { totalItems } = useCart();
  const { status, isGroceriesAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = search
    ? entries.filter((category) => category.name.toLowerCase().includes(search.toLowerCase()))
    : entries;

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.CATEGORIES);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Categories</h1>
        <CartBadge count={totalItems} onClick={() => navigate(ROUTES.CART)} />
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search for a category..." />

      <div className={styles.grid}>
        {filtered.map((cat) => (
          <CategoryCard
            key={cat.id}
            name={cat.name}
            onClick={() => navigate(`/products/${cat.id}`)}
          />
        ))}
      </div>

      <div className={styles.adminBar}>
        {status === 'anonymous' || status === 'bootstrapping' ? (
          <Link to={ROUTES.LOGIN} className={styles.adminLink}>
            Admin
          </Link>
        ) : null}

        {status === 'authenticated' && isGroceriesAdmin ? (
          <div className={styles.adminAuthenticated}>
            <span className={styles.liveLabel}>Catálogo (guest JSON abajo)</span>
            <Link to={ROUTES.ADMIN_PRODUCTS} className={styles.adminLink}>
              Panel admin
            </Link>
            <button
              type="button"
              className={styles.logoutLink}
              onClick={() => {
                void handleLogout();
              }}
            >
              Salir
            </button>
          </div>
        ) : null}

        {status === 'authenticated' && !isGroceriesAdmin ? (
          <div className={styles.adminAuthenticated}>
            <span className={styles.liveLabel}>Sin permiso de administrador</span>
            <button
              type="button"
              className={styles.logoutLink}
              onClick={() => {
                void handleLogout();
              }}
            >
              Salir
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
