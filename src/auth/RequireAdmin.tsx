import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './AuthProvider';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { status, isGroceriesAdmin } = useAuth();

  if (status === 'bootstrapping') {
    return (
      <main aria-busy="true">
        <p>Restoring session…</p>
      </main>
    );
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace />;
  }

  if (!isGroceriesAdmin) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}
