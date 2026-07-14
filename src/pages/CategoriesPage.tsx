import { useState } from 'react';
import type { AuthStatus } from '../auth/AuthProvider';
import { useCategories } from '../hooks/useCategories';
import { SearchBar } from '../components/SearchBar';
import { CategoryCard } from '../components/CategoryCard';
import { CartBadge } from '../components/CartBadge';
import styles from './CategoriesPage.module.css';

type Props = {
  onSelectCategory: (categoryId: number) => void;
  cartCount: number;
  onCartClick: () => void;
  authStatus: AuthStatus;
  isGroceriesAdmin: boolean;
  onAdminClick: () => void;
  onLogout: () => void;
};

export function CategoriesPage({
  onSelectCategory,
  cartCount,
  onCartClick,
  authStatus,
  isGroceriesAdmin,
  onAdminClick,
  onLogout
}: Props) {
  const { entries } = useCategories();
  const [search, setSearch] = useState('');

  const filtered = search
    ? entries.filter((category) => {
        return category.name.toLowerCase().includes(search.toLowerCase());
      })
    : entries;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Categories</h1>
        <CartBadge count={cartCount} onClick={onCartClick} />
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search for a category..."
      />

      <div className={styles.grid}>
        {filtered.map((cat) => {
          return (
            <CategoryCard
              key={cat.id}
              name={cat.name}
              onClick={() => {
                onSelectCategory(cat.id);
              }}
            />
          );
        })}
      </div>

      <div className={styles.adminBar}>
        {authStatus === 'anonymous' || authStatus === 'bootstrapping' ? (
          <button type="button" className={styles.adminLink} onClick={onAdminClick}>
            Admin
          </button>
        ) : null}

        {authStatus === 'authenticated' && isGroceriesAdmin ? (
          <div className={styles.adminAuthenticated}>
            <span className={styles.liveLabel}>Catálogo (guest JSON abajo)</span>
            <button type="button" className={styles.adminLink} onClick={onAdminClick}>
              Panel admin
            </button>
            <button type="button" className={styles.logoutLink} onClick={onLogout}>
              Salir
            </button>
          </div>
        ) : null}

        {authStatus === 'authenticated' && !isGroceriesAdmin ? (
          <div className={styles.adminAuthenticated}>
            <span className={styles.liveLabel}>Sin permiso de administrador</span>
            <button type="button" className={styles.logoutLink} onClick={onLogout}>
              Salir
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
