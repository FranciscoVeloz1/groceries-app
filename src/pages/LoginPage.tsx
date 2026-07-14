import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../api/http';
import { useAuth } from '../auth/AuthProvider';
import { ROUTES } from '../config/routes';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { login, logout, isGroceriesAdmin, status } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && isGroceriesAdmin) {
      navigate(ROUTES.ADMIN_PRODUCTS, { replace: true });
    }
  }, [isGroceriesAdmin, navigate, status]);

  useEffect(() => {
    if (status === 'authenticated' && !isGroceriesAdmin) {
      setError('No tienes permiso de administrador');
    }
  }, [isGroceriesAdmin, status]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (caught) {
      const message =
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : 'No se pudo iniciar sesión';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setError(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate(ROUTES.CATEGORIES)}
          aria-label="Volver"
        >
          ←
        </button>
        <h1 className={styles.title}>Admin</h1>
      </div>

      <p className={styles.subtitle}>Inicia sesión para administrar el catálogo.</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="admin-email">
          Correo
        </label>
        <input
          id="admin-email"
          className={styles.input}
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className={styles.label} htmlFor="admin-password">
          Contraseña
        </label>
        <input
          id="admin-password"
          className={styles.input}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        {error ? <p className={styles.error}>{error}</p> : null}
        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      {status === 'authenticated' && !isGroceriesAdmin ? (
        <button
          type="button"
          className={styles.logout}
          onClick={() => {
            void handleLogout();
          }}
        >
          Cerrar sesión
        </button>
      ) : null}
    </div>
  );
}
