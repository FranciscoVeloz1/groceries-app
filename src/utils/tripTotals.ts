export function lineListTotal(item: { listPrice: number; quantity: number }): number {
  return item.listPrice * item.quantity;
}

export function lineRealTotal(item: {
  realPrice: number | null;
  quantity: number;
}): number | null {
  if (item.realPrice === null || item.realPrice === undefined) {
    return null;
  }

  return item.realPrice * item.quantity;
}

export function sumList(items: Array<{ listPrice: number; quantity: number }>): number {
  return items.reduce((sum, item) => {
    return sum + lineListTotal(item);
  }, 0);
}

export function sumReal(
  items: Array<{ realPrice: number | null; quantity: number }>
): number {
  return items.reduce((sum, item) => {
    const line = lineRealTotal(item);
    return line === null ? sum : sum + line;
  }, 0);
}
