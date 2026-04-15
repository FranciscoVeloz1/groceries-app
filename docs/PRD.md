# Product Requirements Document (PRD)

## Mandado App — Grocery Listing Web Application

**Version:** 1.0
**Date:** 2026-04-14
**Status:** Draft

---

## 1. Purpose

Mandado App is a **mobile-first, frontend-only web application** that allows users to browse grocery products by category, search and filter them, add items to a shopping cart, and export the cart as an Excel file (.xlsx). The app runs entirely on the client side with static data and is deployed on **GitHub Pages**.

---

## 2. Goals

- Provide a clean, fast, touch-friendly grocery browsing experience on mobile devices.
- Allow users to build a shopping cart and export it as a structured Excel file grouped by category.
- Require zero backend infrastructure — all data and logic are client-side.

---

## 3. Target Users

End users who need to assemble and share grocery shopping lists, primarily on mobile devices.

---

## 4. Technical Constraints

| Constraint         | Detail                                      |
|--------------------|---------------------------------------------|
| Framework          | React (recommended)                         |
| Backend            | None — frontend only                        |
| Data storage       | Static JSON file (`/data/products.json`)    |
| Hosting            | GitHub Pages (static)                       |
| Runtime            | All logic runs client-side in the browser   |

---

## 5. Data Model

### 5.1 Product

```ts
type Product = {
  id: number;
  name: string;
  image: string;
  category: number;   // FK to Category
  price: number;
};
```

### 5.2 Categories

```ts
const categories: Record<number, string> = {
  1: "Self cleaning",
  2: "Global cleaning",
  3: "Dogs food",
  4: "Food",
  5: "Extras",
};
```

The `category` field in each product references a key in this mapping.

---

## 6. Features

### 6.1 Product Listing

| Requirement                             | Priority |
|-----------------------------------------|----------|
| Display all products from JSON          | P0       |
| Group or filter products by category    | P0       |
| Product card: image, name, price, add-to-cart button | P0 |

### 6.2 Search & Filtering

| Requirement                                          | Priority |
|------------------------------------------------------|----------|
| Category filter (tabs, dropdown, or chips)           | P0       |
| Search input — filters by product name (case-insensitive) | P0  |

### 6.3 Shopping Cart

| Requirement                                      | Priority |
|--------------------------------------------------|----------|
| Add products to cart                             | P0       |
| Remove products from cart                        | P0       |
| Cart state managed in frontend (React state)     | P0       |
| Optional: persist cart in localStorage           | P1       |

### 6.4 Export to Excel

| Requirement                                              | Priority |
|----------------------------------------------------------|----------|
| Generate `.xlsx` file from cart contents                 | P0       |
| Products grouped by category in the spreadsheet          | P0       |
| Each row includes: Product Name, Quantity, Price         | P0       |
| File is downloadable by the user                         | P0       |
| Use a client-side library (e.g., `exceljs`)             | P0       |

---

## 7. UI / UX Specifications

### 7.1 Design Principles

- **Mobile-first** responsive layout.
- Clean, minimal UI with generous whitespace.
- Optimized for touch interactions (large tap targets).
- Visual style follows the reference mockup (`docs/ui.webp`).

### 7.2 Reference UI Breakdown

Based on the mockup (`docs/ui.webp`), the app has two primary views:

#### Categories View (Home)
- Back navigation arrow at the top.
- Page title: **"Categories"**.
- Search bar: placeholder *"Search for a product..."*.
- Category cards displayed in a grid (2 columns), each showing:
  - Category image/icon.
  - Category name.
  - Short description.
- Categories are visually grouped (e.g., "Standard products", "Animal products").
- Bottom navigation bar with: Home, Categories, Favorite, More.

#### Product List View (Category Detail)
- Back arrow, search icon, and filter icon in the top bar.
- Category title (e.g., **"Fruits & vegetables"**).
- Cart icon with badge (item count) in the top-right corner.
- Product cards in a 2-column grid, each showing:
  - Product image (rounded/soft container).
  - Product name.
  - Unit info (e.g., "By weight, $1.32 / kg").
  - Price prominently displayed.
  - Blue circular **"+"** button to add to cart.

### 7.3 Color Palette (derived from mockup)

| Element              | Color       |
|----------------------|-------------|
| Background           | White / light gray (#F5F5F5) |
| Primary action (add) | Blue (#2563EB) |
| Text (primary)       | Black / dark gray |
| Text (secondary)     | Medium gray |
| Card background      | White with subtle shadow |

---

## 8. Folder Structure

```
/src
  /components      # Reusable UI components (ProductCard, SearchBar, etc.)
  /pages           # Page-level components (Home, CategoryDetail, Cart)
  /hooks           # Custom React hooks (useCart, useSearch, etc.)
  /utils           # Helpers (Excel export, formatting, etc.)
/data
  products.json    # Static product data
/public
  /images          # Product and category images
```

---

## 9. Enhancements (P1 — Post-MVP)

| Enhancement                                        | Notes                                  |
|----------------------------------------------------|----------------------------------------|
| Quantity selector before adding to cart            | Stepper or input on the product card   |
| Improved Excel formatting                          | Bold headers, styled category sections |
| Total price per category and overall in Excel      | Summary rows in spreadsheet            |

---

## 10. Success Criteria

1. User can browse all products and filter by category.
2. User can search products by name.
3. User can add/remove products to/from the cart.
4. User can export the cart as a `.xlsx` file with products grouped by category.
5. App loads and functions correctly on mobile browsers.
6. App is deployable to GitHub Pages with no server-side dependencies.
