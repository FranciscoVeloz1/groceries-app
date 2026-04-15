import { categories } from "../data/categories";
import type { CategoryId } from "../types";

export function useCategories() {
  const entries = (Object.entries(categories) as [string, string][]).map(
    ([id, name]) => ({ id: Number(id) as CategoryId, name }),
  );

  return { categories, entries };
}
