import styles from './AdminNav.module.css';

export type AdminPage = 'admin-products' | 'admin-shopping' | 'admin-history';

type Props = {
  active: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
  onBrowseCatalog?: () => void;
};

export function AdminNav({ active, onNavigate, onLogout, onBrowseCatalog }: Props) {
  return (
    <nav className={styles.nav} aria-label="Admin">
      <div className={styles.links}>
        <button
          type="button"
          className={active === 'admin-products' ? styles.linkActive : styles.link}
          onClick={() => {
            onNavigate('admin-products');
          }}
        >
          Productos
        </button>
        <button
          type="button"
          className={active === 'admin-shopping' ? styles.linkActive : styles.link}
          onClick={() => {
            onNavigate('admin-shopping');
          }}
        >
          Compra
        </button>
        <button
          type="button"
          className={active === 'admin-history' ? styles.linkActive : styles.link}
          onClick={() => {
            onNavigate('admin-history');
          }}
        >
          Historial
        </button>
      </div>
      <div className={styles.actions}>
        {onBrowseCatalog ? (
          <button type="button" className={styles.secondary} onClick={onBrowseCatalog}>
            Catálogo
          </button>
        ) : null}
        <button type="button" className={styles.logout} onClick={onLogout}>
          Salir
        </button>
      </div>
    </nav>
  );
}
