import type { CartItem } from "../hooks/useCart";
import { exportToExcel } from "./exportToExcel";
import { exportToJson } from "./exportToJson";

export async function exportGroceryList(items: CartItem[]) {
  await exportToExcel(items);
  exportToJson(items);
}
