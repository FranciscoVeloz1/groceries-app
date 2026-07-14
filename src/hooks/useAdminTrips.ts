import { useCallback, useState } from 'react';
import * as groceriesApi from '../api/groceries';
import type { ApiTrip, TripItemInput } from '../api/types';
import type { CartItem } from './useCart';

export function cartToTripItems(items: CartItem[]): TripItemInput[] {
  return items.map((item, index) => {
    return {
      productId: null,
      name: item.product.name,
      category: item.product.category,
      quantity: item.quantity,
      listPrice: item.product.price,
      realPrice: null,
      sortOrder: index
    };
  });
}

export function useAdminTrips() {
  const [activeDraft, setActiveDraft] = useState<ApiTrip | null>(null);
  const [completedTrips, setCompletedTrips] = useState<ApiTrip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDraft = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const drafts = await groceriesApi.listTrips('DRAFT');
      const newest = drafts[0] ?? null;
      setActiveDraft(newest);
      return newest;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Failed to load draft';
      setError(message);
      throw caught;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCompleted = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const trips = await groceriesApi.listTrips('COMPLETED');
      setCompletedTrips(trips);
      return trips;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Failed to load history';
      setError(message);
      throw caught;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTrip = useCallback(async (id: string) => {
    const trip = await groceriesApi.getTrip(id);
    if (trip.status === 'DRAFT') {
      setActiveDraft(trip);
    }
    return trip;
  }, []);

  const createEmpty = useCallback(async () => {
    const trip = await groceriesApi.createTrip({ items: [] });
    setActiveDraft(trip);
    return trip;
  }, []);

  const createFromCartItems = useCallback(async (items: CartItem[]) => {
    const trip = await groceriesApi.createTrip({
      items: cartToTripItems(items)
    });
    setActiveDraft(trip);
    return trip;
  }, []);

  const saveItems = useCallback(async (tripId: string, items: TripItemInput[]) => {
    const trip = await groceriesApi.replaceTripItems(tripId, { items });
    setActiveDraft(trip);
    return trip;
  }, []);

  const complete = useCallback(async (tripId: string) => {
    const trip = await groceriesApi.completeTrip(tripId);
    setActiveDraft(null);
    setCompletedTrips((current) => {
      return [trip, ...current];
    });
    return trip;
  }, []);

  const remove = useCallback(async (tripId: string) => {
    await groceriesApi.deleteTrip(tripId);
    setActiveDraft((current) => {
      return current?.id === tripId ? null : current;
    });
    setCompletedTrips((current) => {
      return current.filter((trip) => {
        return trip.id !== tripId;
      });
    });
  }, []);

  return {
    activeDraft,
    completedTrips,
    loading,
    error,
    loadDraft,
    loadCompleted,
    loadTrip,
    createEmpty,
    createFromCartItems,
    saveItems,
    complete,
    remove,
    setActiveDraft
  };
}
