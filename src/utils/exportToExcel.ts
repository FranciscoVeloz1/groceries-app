import type { CartItem } from "../hooks/useCart";
import { categories } from "../data/categories";
import type { Categories } from "../types";
import { downloadFile } from "./downloadFile";
import { FILE_BASENAME } from "./groceryList";

export async function exportToExcel(items: CartItem[]) {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.default.Workbook();
  const sheet = workbook.addWorksheet("Lista de Mandado");

  const defaultFont = { name: "Arial" as const, size: 11 };

  // Set column widths (aligned with write order)
  sheet.columns = [
    { key: "name", width: 30 },
    { key: "quantity", width: 12 },
    { key: "price", width: 15 },
    { key: "total", width: 15 },
    { key: "realPrice", width: 15 },
    { key: "realGrandTotal", width: 15 },
  ];

  // Group items by category
  const grouped = new Map<number, CartItem[]>();
  for (const item of items) {
    const cat = item.product.category;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(item);
  }

  let grandTotal = 0;
  const realSubtotalRefs: string[] = [];

  for (const [catId, catItems] of grouped) {
    const catName =
      categories[catId as keyof Categories] ?? `Categoría ${catId}`;

    // Category header row
    const headerRow = sheet.addRow([catName]);
    headerRow.font = { ...defaultFont, bold: true, size: 13 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE8E8E8" },
    };
    sheet.mergeCells(headerRow.number, 1, headerRow.number, 5);

    // Column headers
    const colRow = sheet.addRow([
      "Producto",
      "Cantidad",
      "Precio",
      "Total",
      "Precio Real",
    ]);
    colRow.font = { ...defaultFont, bold: true };
    colRow.border = {
      bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
    };

    // Items
    let categoryTotal = 0;
    let firstItemRow: number | null = null;
    let lastItemRow: number | null = null;

    for (const item of catItems) {
      const lineTotal = item.product.price * item.quantity;

      categoryTotal += lineTotal;

      const row = sheet.addRow([
        item.product.name,
        item.quantity,
        item.product.price,
        lineTotal,
        "",
      ]);

      if (firstItemRow === null) firstItemRow = row.number;
      lastItemRow = row.number;

      row.font = defaultFont;
      row.getCell(3).numFmt = "$#,##0.00";
      row.getCell(4).numFmt = "$#,##0.00";
      row.getCell(5).numFmt = "$#,##0.00";
    }

    // Category subtotal — list price in D, SUM of Precio Real in E
    const subtotalRow = sheet.addRow(["", "", "Subtotal", categoryTotal]);
    subtotalRow.font = { ...defaultFont, bold: true, italic: true };
    subtotalRow.getCell(4).numFmt = "$#,##0.00";

    const realSubtotalCell = subtotalRow.getCell(5);
    realSubtotalCell.numFmt = "$#,##0.00";
    if (firstItemRow !== null && lastItemRow !== null) {
      realSubtotalCell.value = {
        formula: `SUM(E${firstItemRow}:E${lastItemRow})`,
      };
    } else {
      realSubtotalCell.value = 0;
    }
    realSubtotalRefs.push(`E${subtotalRow.number}`);

    grandTotal += categoryTotal;

    // Blank separator
    sheet.addRow([]);
  }

  // Grand total — list price in E, SUM of real subtotals in F
  const totalRow = sheet.addRow(["", "", "", "TOTAL", grandTotal]);
  totalRow.font = { ...defaultFont, bold: true, size: 14 };
  totalRow.getCell(5).numFmt = "$#,##0.00";
  totalRow.border = {
    top: { style: "double", color: { argb: "FF000000" } },
  };

  if (realSubtotalRefs.length > 0) {
    const realGrandTotalCell = totalRow.getCell(6);
    realGrandTotalCell.value = {
      formula: `SUM(${realSubtotalRefs.join(",")})`,
    };
    realGrandTotalCell.numFmt = "$#,##0.00";
    realGrandTotalCell.font = { ...defaultFont, bold: true, size: 14 };
  }

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  downloadFile(blob, `${FILE_BASENAME}.xlsx`);
}
