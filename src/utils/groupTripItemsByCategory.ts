const CATEGORY_ORDER = [1, 2, 3, 4, 5] as const;

export function groupTripItemsByCategory<T extends { category: number }>(
  items: T[]
): Array<{ categoryId: number; items: T[] }> {
  const grouped = new Map<number, T[]>();

  for (const item of items) {
    const existing = grouped.get(item.category);
    if (existing) {
      existing.push(item);
    } else {
      grouped.set(item.category, [item]);
    }
  }

  return CATEGORY_ORDER.flatMap((categoryId) => {
    const categoryItems = grouped.get(categoryId);
    if (!categoryItems || categoryItems.length === 0) {
      return [];
    }

    return [{ categoryId, items: categoryItems }];
  });
}
