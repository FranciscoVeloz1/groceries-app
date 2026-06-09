import type { CartItem } from "../hooks/useCart";
import { downloadFile } from "./downloadFile";
import { FILE_BASENAME, serializeGroceryList } from "./groceryList";

export function exportToJson(items: CartItem[]) {
  const data = serializeGroceryList(items);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  downloadFile(blob, `${FILE_BASENAME}.json`);
}
