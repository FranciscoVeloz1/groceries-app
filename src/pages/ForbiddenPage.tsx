import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import styles from './ForbiddenPage.module.css';

export function ForbiddenPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Acceso restringido</h1>
      <p className={styles.text}>No tienes permiso de administrador.</p>
      <Link className={styles.link} to={ROUTES.CATEGORIES}>
        Volver al catálogo
      </Link>
    </div>
  );
}
