import { useCallback, useEffect, useState } from 'react';
import * as groceriesApi from '../api/groceries';
import { ApiError } from '../api/http';
import type { ApiProduct, CreateProductBody, PatchProductBody } from '../api/types';
import { useAuth } from '../auth/AuthProvider';

type AdminProductsState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  products: ApiProduct[];
  message: string | null;
};

const INITIAL_STATE: AdminProductsState = {
  status: 'idle',
  products: [],
  message: null
};

export function useAdminProducts() {
  const { isGroceriesAdmin } = useAuth();
  const [state, setState] = useState<AdminProductsState>(INITIAL_STATE);

  const load = useCallback(async () => {
    if (!isGroceriesAdmin) {
      setState({
        status: 'error',
        products: [],
        message: 'No tienes permiso de administrador'
      });
      return;
    }

    setState((current) => {
      return {
        status: 'loading',
        products: current.products,
        message: null
      };
    });

    try {
      const products = await groceriesApi.listProducts();
      setState({
        status: 'ready',
        products,
        message: null
      });
    } catch (caught) {
      const message =
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : 'No se pudieron cargar los productos';
      setState((current) => {
        return {
          status: 'error',
          products: current.products,
          message
        };
      });
    }
  }, [isGroceriesAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(async (body: CreateProductBody) => {
    const product = await groceriesApi.createProduct(body);
    setState((current) => {
      return {
        status: 'ready',
        message: null,
        products: [...current.products, product].toSorted((a, b) => {
          return a.name.localeCompare(b.name);
        })
      };
    });
    return product;
  }, []);

  const update = useCallback(async (id: string, body: PatchProductBody) => {
    const product = await groceriesApi.updateProduct(id, body);
    setState((current) => {
      return {
        status: 'ready',
        message: null,
        products: current.products.map((entry) => {
          return entry.id === id ? product : entry;
        })
      };
    });
    return product;
  }, []);

  const remove = useCallback(async (id: string) => {
    await groceriesApi.deleteProduct(id);
    setState((current) => {
      return {
        status: 'ready',
        message: null,
        products: current.products.filter((entry) => {
          return entry.id !== id;
        })
      };
    });
  }, []);

  return {
    state,
    reload: load,
    create,
    update,
    remove
  };
}
