import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RequireAdmin } from './RequireAdmin';

let currentAuth: {
  status: 'bootstrapping' | 'authenticated' | 'anonymous';
  isGroceriesAdmin: boolean;
} = {
  status: 'anonymous',
  isGroceriesAdmin: false
};

vi.mock('./AuthProvider', () => ({
  useAuth: () => currentAuth
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/"
          element={
            <RequireAdmin>
              <h1>Protected</h1>
            </RequireAdmin>
          }
        />
        <Route path="/login" element={<h1>LoginPage</h1>} />
        <Route path="/forbidden" element={<h1>ForbiddenPage</h1>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RequireAdmin', () => {
  it('shows a loading state while bootstrapping', () => {
    currentAuth = { status: 'bootstrapping', isGroceriesAdmin: false };
    renderAt('/');
    expect(screen.getByText(/Restoring session/i)).toBeInTheDocument();
    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
  });

  it('redirects anonymous users to /login', () => {
    currentAuth = { status: 'anonymous', isGroceriesAdmin: false };
    renderAt('/');
    expect(screen.getByText('LoginPage')).toBeInTheDocument();
    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
  });

  it('redirects authenticated non-admins to /forbidden', () => {
    currentAuth = { status: 'authenticated', isGroceriesAdmin: false };
    renderAt('/');
    expect(screen.getByText('ForbiddenPage')).toBeInTheDocument();
    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
  });

  it('renders children for an admin', () => {
    currentAuth = { status: 'authenticated', isGroceriesAdmin: true };
    renderAt('/');
    expect(screen.getByText('Protected')).toBeInTheDocument();
  });
});
