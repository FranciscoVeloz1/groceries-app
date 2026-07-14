import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { ROUTES } from '../../config/routes';
import styles from './AdminNav.module.css';

export function AdminNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.CATEGORIES);
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? styles.linkActive : styles.link;

  return (
    <nav className={styles.nav} aria-label="Admin">
      <div className={styles.links}>
        <NavLink to={ROUTES.ADMIN_PRODUCTS} className={linkClass}>
          Productos
        </NavLink>
        <NavLink to={ROUTES.ADMIN_SHOPPING} className={linkClass}>
          Compra
        </NavLink>
        <NavLink to={ROUTES.ADMIN_HISTORY} className={linkClass}>
          Historial
        </NavLink>
      </div>
      <div className={styles.actions}>
        <NavLink to={ROUTES.CATEGORIES} className={styles.secondary}>
          Catálogo
        </NavLink>
        <button
          type="button"
          className={styles.logout}
          onClick={() => {
            void handleLogout();
          }}
        >
          Salir
        </button>
      </div>
    </nav>
  );
}
