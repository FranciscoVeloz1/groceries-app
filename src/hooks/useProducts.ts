import { useMemo } from "react";
import productsData from "../../data/products.json";
import type { Product } from "../types";

const products: Product[] = productsData;

export function useProducts(categoryId?: number, search?: string) {
  const filtered = useMemo(() => {
    let result = products;

    if (categoryId) {
      result = result.filter((p) => p.category === categoryId);
    }

    if (search) {
      const term = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(term));
    }

    return result;
  }, [categoryId, search]);

  return filtered;
}
