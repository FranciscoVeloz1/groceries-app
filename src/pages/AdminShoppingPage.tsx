import { useEffect, useMemo, useState } from 'react';
import * as groceriesApi from '../api/groceries';
import { ApiError } from '../api/http';
import type { ApiProduct, ApiTripItem, TripItemInput } from '../api/types';
import { AdminNav, type AdminPage } from '../components/AdminNav';
import { categories } from '../data/categories';
import { useAdminTrips } from '../hooks/useAdminTrips';
import type { CategoryId } from '../types/domain';
import { groupTripItemsByCategory } from '../utils/groupTripItemsByCategory';
import { lineListTotal, lineRealTotal, sumList, sumReal } from '../utils/tripTotals';
import styles from './AdminShoppingPage.module.css';

type EditableItem = {
  key: string;
  productId: string | null;
  name: string;
  category: number;
  quantity: number;
  listPrice: number;
  realPrice: number | null;
  sortOrder: number;
};

type Props = {
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
  onBrowseCatalog: () => void;
  onCompleted: (tripId: string) => void;
};

function toEditable(items: ApiTripItem[]): EditableItem[] {
  return items.map((item, index) => {
    return {
      key: item.id,
      productId: item.productId,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      listPrice: item.listPrice,
      realPrice: item.realPrice,
      sortOrder: item.sortOrder ?? index
    };
  });
}

function toTripInputs(items: EditableItem[]): TripItemInput[] {
  return items.map((item, index) => {
    return {
      productId: item.productId,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      listPrice: item.listPrice,
      realPrice: item.realPrice,
      sortOrder: item.sortOrder ?? index
    };
  });
}

export function AdminShoppingPage({
  onNavigate,
  onLogout,
  onBrowseCatalog,
  onCompleted
}: Props) {
  const trips = useAdminTrips();
  const [items, setItems] = useState<EditableItem[]>([]);
  const [catalog, setCatalog] = useState<ApiProduct[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const draft = await trips.loadDraft();
        if (draft) {
          setItems(toEditable(draft.items));
        }
        const products = await groceriesApi.listProducts();
        setCatalog(products);
      } catch (caught) {
        const text =
          caught instanceof ApiError
            ? caught.message
            : caught instanceof Error
              ? caught.message
              : 'Error al cargar'
        ;
        setMessage(text);
      }
    })();
  }, []);

  const groups = useMemo(() => {
    return groupTripItemsByCategory(items);
  }, [items]);

  const listTotal = sumList(items);
  const realTotal = sumReal(items);

  const ensureDraft = async () => {
    if (trips.activeDraft) {
      return trips.activeDraft;
    }

    return trips.createEmpty();
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const draft = await ensureDraft();
      const saved = await trips.saveItems(draft.id, toTripInputs(items));
      setItems(toEditable(saved.items));
      setMessage('Borrador guardado');
    } catch (caught) {
      const text =
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : 'No se pudo guardar';
      setMessage(text);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    const confirmed = window.confirm('¿Completar mandado? No podrás editar los precios después.');
    if (!confirmed) {
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const draft = await ensureDraft();
      await trips.saveItems(draft.id, toTripInputs(items));
      const completed = await trips.complete(draft.id);
      onCompleted(completed.id);
    } catch (caught) {
      const text =
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : 'No se pudo completar';
      setMessage(text);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEmpty = async () => {
    setMessage(null);
    try {
      const draft = await trips.createEmpty();
      setItems(toEditable(draft.items));
    } catch (caught) {
      const text =
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : 'No se pudo crear el borrador';
      setMessage(text);
    }
  };

  const updateItem = (key: string, patch: Partial<EditableItem>) => {
    setItems((current) => {
      return current.map((item) => {
        return item.key === key ? { ...item, ...patch } : item;
      });
    });
  };

  const removeItem = (key: string) => {
    setItems((current) => {
      return current.filter((item) => {
        return item.key !== key;
      });
    });
  };

  const addCustom = () => {
    const price = Number(customPrice);
    if (!customName.trim() || Number.isNaN(price) || price < 0) {
      setMessage('Nombre y precio válidos requeridos para el extra');
      return;
    }

    setItems((current) => {
      return [
        ...current,
        {
          key: `local-${Date.now()}`,
          productId: null,
          name: customName.trim(),
          category: 5,
          quantity: 1,
          listPrice: price,
          realPrice: null,
          sortOrder: current.length
        }
      ];
    });
    setCustomName('');
    setCustomPrice('');
  };

  const addFromCatalog = (product: ApiProduct) => {
    setItems((current) => {
      const existing = current.find((item) => {
        return item.productId === product.id;
      });
      if (existing) {
        return current.map((item) => {
          return item.key === existing.key
            ? { ...item, quantity: item.quantity + 1 }
            : item;
        });
      }

      return [
        ...current,
        {
          key: `local-${product.id}-${Date.now()}`,
          productId: product.id,
          name: product.name,
          category: product.category,
          quantity: 1,
          listPrice: product.price,
          realPrice: null,
          sortOrder: current.length
        }
      ];
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Compra</h1>
        <span className={styles.badge}>Precio Real</span>
      </div>

      <AdminNav
        active="admin-shopping"
        onNavigate={onNavigate}
        onLogout={onLogout}
        onBrowseCatalog={onBrowseCatalog}
      />

      {trips.loading && !trips.activeDraft ? (
        <p className={styles.status}>Cargando borrador…</p>
      ) : null}
      {message ? <p className={styles.message}>{message}</p> : null}

      {!trips.activeDraft && items.length === 0 ? (
        <div className={styles.emptyActions}>
          <p className={styles.status}>No hay mandado en borrador.</p>
          <button type="button" className={styles.primary} onClick={handleCreateEmpty}>
            Crear borrador vacío
          </button>
        </div>
      ) : null}

      {groups.map((group) => {
        const categoryLabel =
          categories[group.categoryId as CategoryId] ?? `Categoría ${group.categoryId}`;
        const groupList = sumList(group.items);
        const groupReal = sumReal(group.items);

        return (
          <section key={group.categoryId} className={styles.group}>
            <h2 className={styles.groupTitle}>{categoryLabel}</h2>
            <div className={styles.tableHead}>
              <span>Producto</span>
              <span>Cant.</span>
              <span>Precio</span>
              <span>Total</span>
              <span>Real</span>
            </div>
            {group.items.map((item) => {
              const realLine = lineRealTotal(item);
              return (
                <div key={item.key} className={styles.row}>
                  <span className={styles.name}>{item.name}</span>
                  <div className={styles.qty}>
                    <button
                      type="button"
                      onClick={() => {
                        updateItem(item.key, {
                          quantity: Math.max(1, item.quantity - 1)
                        });
                      }}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => {
                        updateItem(item.key, { quantity: item.quantity + 1 });
                      }}
                    >
                      +
                    </button>
                  </div>
                  <span>${item.listPrice.toFixed(2)}</span>
                  <span>${lineListTotal(item).toFixed(2)}</span>
                  <div className={styles.realCell}>
                    <input
                      className={styles.realInput}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.realPrice ?? ''}
                      placeholder="—"
                      onChange={(event) => {
                        const value = event.target.value;
                        updateItem(item.key, {
                          realPrice: value === '' ? null : Number(value)
                        });
                      }}
                    />
                    <span className={styles.realHint}>
                      {realLine === null ? '—' : `$${realLine.toFixed(2)}`}
                    </span>
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => {
                        removeItem(item.key);
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
            <div className={styles.subtotal}>
              <span>Subtotal lista ${groupList.toFixed(2)}</span>
              <span>Subtotal real ${groupReal.toFixed(2)}</span>
            </div>
          </section>
        );
      })}

      <div className={styles.totals}>
        <div>
          <span>Total lista</span>
          <strong>${listTotal.toFixed(2)}</strong>
        </div>
        <div>
          <span>Total real</span>
          <strong>${realTotal.toFixed(2)}</strong>
        </div>
      </div>

      <div className={styles.customBox}>
        <h3>Agregar extra</h3>
        <input
          className={styles.input}
          placeholder="Nombre"
          value={customName}
          onChange={(event) => {
            setCustomName(event.target.value);
          }}
        />
        <input
          className={styles.input}
          placeholder="Precio lista"
          type="number"
          min="0"
          step="0.01"
          value={customPrice}
          onChange={(event) => {
            setCustomPrice(event.target.value);
          }}
        />
        <button type="button" className={styles.secondary} onClick={addCustom}>
          Agregar
        </button>
      </div>

      <div className={styles.catalogBox}>
        <h3>Agregar del catálogo</h3>
        <div className={styles.catalogList}>
          {catalog.slice(0, 40).map((product) => {
            return (
              <button
                key={product.id}
                type="button"
                className={styles.catalogItem}
                onClick={() => {
                  addFromCatalog(product);
                }}
              >
                {product.name} · ${product.price}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.secondary} disabled={saving} onClick={handleSave}>
          {saving ? 'Guardando…' : 'Guardar borrador'}
        </button>
        <button type="button" className={styles.primary} disabled={saving} onClick={handleComplete}>
          Completar mandado
        </button>
      </div>
    </div>
  );
}
