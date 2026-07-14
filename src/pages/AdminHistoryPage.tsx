import { useEffect, useMemo, useState } from 'react';
import { ApiError } from '../api/http';
import type { ApiTrip } from '../api/types';
import { AdminNav, type AdminPage } from '../components/AdminNav';
import { categories } from '../data/categories';
import { useAdminTrips } from '../hooks/useAdminTrips';
import type { CategoryId } from '../types/domain';
import { groupTripItemsByCategory } from '../utils/groupTripItemsByCategory';
import { lineListTotal, lineRealTotal, sumList, sumReal } from '../utils/tripTotals';
import styles from './AdminHistoryPage.module.css';

type Props = {
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
  onBrowseCatalog: () => void;
  initialTripId?: string | null;
};

export function AdminHistoryPage({
  onNavigate,
  onLogout,
  onBrowseCatalog,
  initialTripId = null
}: Props) {
  const trips = useAdminTrips();
  const [selected, setSelected] = useState<ApiTrip | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const list = await trips.loadCompleted();
        if (initialTripId) {
          const match = list.find((trip) => {
            return trip.id === initialTripId;
          });
          if (match) {
            setSelected(match);
          } else {
            const trip = await trips.loadTrip(initialTripId);
            setSelected(trip);
          }
        }
      } catch (caught) {
        const text =
          caught instanceof ApiError
            ? caught.message
            : caught instanceof Error
              ? caught.message
              : 'No se pudo cargar el historial';
        setMessage(text);
      }
    })();
  }, [initialTripId]);

  const selectedGroups = useMemo(() => {
    if (!selected) {
      return [];
    }

    return groupTripItemsByCategory(selected.items);
  }, [selected]);

  const handleDelete = async (trip: ApiTrip) => {
    const confirmed = window.confirm('¿Eliminar este mandado del historial?');
    if (!confirmed) {
      return;
    }

    try {
      await trips.remove(trip.id);
      if (selected?.id === trip.id) {
        setSelected(null);
      }
    } catch (caught) {
      const text =
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : 'No se pudo eliminar';
      setMessage(text);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Historial</h1>
      </div>

      <AdminNav
        active="admin-history"
        onNavigate={onNavigate}
        onLogout={onLogout}
        onBrowseCatalog={onBrowseCatalog}
      />

      {message ? <p className={styles.message}>{message}</p> : null}
      {trips.loading && trips.completedTrips.length === 0 ? (
        <p className={styles.status}>Cargando…</p>
      ) : null}

      {!selected ? (
        <ul className={styles.list}>
          {trips.completedTrips.length === 0 && !trips.loading ? (
            <li className={styles.status}>Aún no hay mandados completados.</li>
          ) : null}
          {trips.completedTrips.map((trip) => {
            const listTotal = sumList(trip.items);
            const realTotal = sumReal(trip.items);
            return (
              <li key={trip.id} className={styles.card}>
                <button
                  type="button"
                  className={styles.cardMain}
                  onClick={() => {
                    setSelected(trip);
                  }}
                >
                  <span className={styles.cardTitle}>
                    {trip.completedAt
                      ? new Date(trip.completedAt).toLocaleString()
                      : 'Completado'}
                  </span>
                  <span className={styles.cardMeta}>
                    {trip.items.length} ítems · lista ${listTotal.toFixed(2)} · real $
                    {realTotal.toFixed(2)}
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.danger}
                  onClick={() => {
                    void handleDelete(trip);
                  }}
                >
                  Eliminar
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className={styles.detail}>
          <button
            type="button"
            className={styles.back}
            onClick={() => {
              setSelected(null);
            }}
          >
            ← Volver al listado
          </button>
          <h2 className={styles.detailTitle}>
            {selected.completedAt
              ? new Date(selected.completedAt).toLocaleString()
              : 'Detalle'}
          </h2>
          {selectedGroups.map((group) => {
            const categoryLabel =
              categories[group.categoryId as CategoryId] ?? `Categoría ${group.categoryId}`;
            return (
              <section key={group.categoryId} className={styles.group}>
                <h3>{categoryLabel}</h3>
                {group.items.map((item) => {
                  const realLine = lineRealTotal(item);
                  return (
                    <div key={item.id} className={styles.row}>
                      <span>{item.name}</span>
                      <span>×{item.quantity}</span>
                      <span>${item.listPrice.toFixed(2)}</span>
                      <span>${lineListTotal(item).toFixed(2)}</span>
                      <span>{realLine === null ? '—' : `$${realLine.toFixed(2)}`}</span>
                    </div>
                  );
                })}
              </section>
            );
          })}
          <div className={styles.totals}>
            <span>Total lista ${sumList(selected.items).toFixed(2)}</span>
            <span>Total real ${sumReal(selected.items).toFixed(2)}</span>
          </div>
          <button
            type="button"
            className={styles.danger}
            onClick={() => {
              void handleDelete(selected);
            }}
          >
            Eliminar mandado
          </button>
        </div>
      )}
    </div>
  );
}
