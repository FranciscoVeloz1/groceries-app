import { useState, type FormEvent } from 'react';
import { ApiError } from '../api/http';
import type { ApiProduct } from '../api/types';
import { AdminNav, type AdminPage } from '../components/AdminNav';
import { categories } from '../data/categories';
import { useAdminProducts } from '../hooks/useAdminProducts';
import type { CategoryId } from '../types';
import styles from './AdminProductsPage.module.css';

type Props = {
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
  onBrowseCatalog: () => void;
};

type FormState = {
  name: string;
  category: number;
  price: string;
  image: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  category: 1,
  price: '',
  image: ''
};

export function AdminProductsPage({ onNavigate, onLogout, onBrowseCatalog }: Props) {
  const { state, create, update, remove, reload } = useAdminProducts();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const startEdit = (product: ApiProduct) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      image: product.image
    });
    setFormError(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const price = Number(form.price);
    if (!form.name.trim() || Number.isNaN(price) || price < 0) {
      setFormError('Nombre y precio válidos son requeridos');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await update(editingId, {
          name: form.name.trim(),
          category: form.category,
          price,
          image: form.image.trim()
        });
      } else {
        await create({
          name: form.name.trim(),
          category: form.category,
          price,
          image: form.image.trim() || undefined
        });
      }
      resetForm();
    } catch (caught) {
      const message =
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : 'No se pudo guardar';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: ApiProduct) => {
    const confirmed = window.confirm(`¿Eliminar "${product.name}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await remove(product.id);
      if (editingId === product.id) {
        resetForm();
      }
    } catch (caught) {
      const message =
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : 'No se pudo eliminar';
      setFormError(message);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Productos</h1>
        <span className={styles.badge}>Catálogo en vivo</span>
      </div>

      <AdminNav
        active="admin-products"
        onNavigate={onNavigate}
        onLogout={onLogout}
        onBrowseCatalog={onBrowseCatalog}
      />

      {state.status === 'loading' && state.products.length === 0 ? (
        <p className={styles.status}>Cargando productos…</p>
      ) : null}
      {state.status === 'error' && state.message ? (
        <p className={styles.error}>
          {state.message}{' '}
          <button type="button" className={styles.retry} onClick={reload}>
            Reintentar
          </button>
        </p>
      ) : null}
      {state.status === 'ready' && state.products.length === 0 ? (
        <p className={styles.status}>No hay productos en el catálogo.</p>
      ) : null}

      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.formTitle}>{editingId ? 'Editar producto' : 'Nuevo producto'}</h2>
        <input
          className={styles.input}
          placeholder="Nombre"
          value={form.name}
          onChange={(event) => {
            setForm((current) => {
              return { ...current, name: event.target.value };
            });
          }}
          required
        />
        <select
          className={styles.input}
          value={form.category}
          onChange={(event) => {
            setForm((current) => {
              return { ...current, category: Number(event.target.value) };
            });
          }}
        >
          {(Object.keys(categories) as unknown as CategoryId[]).map((id) => {
            return (
              <option key={id} value={id}>
                {categories[id]}
              </option>
            );
          })}
        </select>
        <input
          className={styles.input}
          placeholder="Precio"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(event) => {
            setForm((current) => {
              return { ...current, price: event.target.value };
            });
          }}
          required
        />
        <input
          className={styles.input}
          placeholder="Imagen (opcional)"
          value={form.image}
          onChange={(event) => {
            setForm((current) => {
              return { ...current, image: event.target.value };
            });
          }}
        />
        {formError ? <p className={styles.error}>{formError}</p> : null}
        <div className={styles.formActions}>
          <button type="submit" className={styles.primary} disabled={saving}>
            {saving ? 'Guardando…' : editingId ? 'Guardar' : 'Crear'}
          </button>
          {editingId ? (
            <button type="button" className={styles.secondary} onClick={resetForm}>
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      <ul className={styles.list}>
        {state.products.map((product) => {
          const categoryLabel =
            categories[product.category as CategoryId] ?? `Categoría ${product.category}`;
          return (
            <li key={product.id} className={styles.item}>
              <div>
                <p className={styles.itemName}>{product.name}</p>
                <p className={styles.itemMeta}>
                  {categoryLabel} · ${product.price}
                  {product.image ? ` · ${product.image}` : ''}
                </p>
              </div>
              <div className={styles.itemActions}>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => {
                    startEdit(product);
                  }}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className={styles.danger}
                  onClick={() => {
                    void handleDelete(product);
                  }}
                >
                  Eliminar
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
