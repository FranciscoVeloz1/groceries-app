import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "../types";
import { parseStoredCart } from "../utils/groceryList";

const STORAGE_KEY = "mandado-cart:v1";

export type CartItem = {
  product: Product;
  quantity: number;
};

function readStored(): Map<number, CartItem> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return new Map();
    }
    const parsed = parseStoredCart(raw);
    return new Map(parsed.map((item) => [item.product.id, item]));
  } catch {
    return new Map();
  }
}

function writeStored(items: Map<number, CartItem>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...items.values()]));
  } catch {
    // private mode or quota
  }
}

function nextCustomId(ids: Iterable<number>): number {
  let next = -1;
  for (const id of ids) {
    if (id <= next) {
      next = id - 1;
    }
  }
  return next;
}

export function useCart() {
  const [items, setItems] = useState<Map<number, CartItem>>(() => readStored());
  const customIdRef = useRef(nextCustomId(items.keys()));

  useEffect(() => {
    writeStored(items);
  }, [items]);

  const addToCart = useCallback((product: Product) => {
    setItems((prev) => {
      const next = new Map(prev);
      const existing = next.get(product.id);

      if (existing) {
        next.set(product.id, { ...existing, quantity: existing.quantity + 1 });
      } else {
        next.set(product.id, { product, quantity: 1 });
      }

      return next;
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setItems((prev) => {
      const next = new Map(prev);
      next.delete(productId);

      return next;
    });
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prev) => {
      const next = new Map(prev);

      if (quantity <= 0) {
        next.delete(productId);
      } else {
        const existing = next.get(productId);

        if (existing) {
          next.set(productId, { ...existing, quantity });
        }
      }
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems(new Map());
  }, []);

  const addCustomItem = useCallback(
    ({ name, quantity, price }: { name: string; quantity: number; price: number }) => {
      setItems((prev) => {
        const id = nextCustomId(prev.keys());
        customIdRef.current = id - 1;
        const product: Product = {
          id,
          name,
          image: "",
          category: 5,
          price,
        };
        const next = new Map(prev);
        next.set(product.id, { product, quantity });
        return next;
      });
    },
    [],
  );

  const importCart = useCallback((incoming: CartItem[]) => {
    const next = new Map<number, CartItem>();
    for (const item of incoming) {
      const existing = next.get(item.product.id);
      if (existing) {
        next.set(item.product.id, {
          ...existing,
          quantity: existing.quantity + item.quantity,
        });
      } else {
        next.set(item.product.id, item);
      }
    }
    customIdRef.current = Math.min(
      customIdRef.current,
      nextCustomId(next.keys()),
    );
    setItems(next);
  }, []);

  const cartItems = useMemo(() => Array.from(items.values()), [items]);

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const totalPrice = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      ),
    [cartItems],
  );

  return {
    items: cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    addCustomItem,
    importCart,
    totalItems,
    totalPrice,
  };
}
