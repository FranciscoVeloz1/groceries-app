import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import type { Product } from '../types/domain';

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  addCustomItem: (item: { name: string; quantity: number; price: number }) => void;
  importCart: (items: CartItem[]) => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Map<number, CartItem>>(new Map());
  const customIdRef = useRef(-1);

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
      const product: Product = {
        id: customIdRef.current--,
        name,
        image: '',
        category: 5,
        price
      };
      setItems((prev) => {
        const next = new Map(prev);
        next.set(product.id, { product, quantity });
        return next;
      });
    },
    []
  );

  const importCart = useCallback((incoming: CartItem[]) => {
    const next = new Map<number, CartItem>();
    for (const item of incoming) {
      const existing = next.get(item.product.id);
      if (existing) {
        next.set(item.product.id, {
          ...existing,
          quantity: existing.quantity + item.quantity
        });
      } else {
        next.set(item.product.id, item);
      }
    }
    setItems(next);
  }, []);

  const cartItems = useMemo(() => Array.from(items.values()), [items]);
  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );
  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items: cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      addCustomItem,
      importCart,
      totalItems,
      totalPrice
    }),
    [
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      addCustomItem,
      importCart,
      cartItems,
      totalItems,
      totalPrice
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error('useCart must be used within CartProvider');
  }
  return value;
}
