## 🧾 Grocery Listing App — Requirements (AI-Ready Spec)

### 1. Overview

Build a **mobile-first frontend web application** that displays a list of grocery products.
The app will allow users to:

* Browse products by category
* Search and filter products
* Add products to a shopping cart
* Export the cart as an Excel file

⚠️ Constraints:

* **No backend** (frontend-only app)
* Data is **static and stored in code (JSON file)**
* App will be deployed on **GitHub Pages**

---

### 2. Data Source

All product data must be stored in a local JSON file (e.g., `/data/products.json`).

#### Product Schema

Each product must follow this structure:

```ts
type Product = {
  id: number;
  name: string;
  image: string;
  category: number;
  price: number;
};
```

#### Categories

Categories are represented by numeric IDs:

```ts
const categories = {
  1: "Self cleaning",
  2: "Global cleaning",
  3: "Dogs food",
  4: "Food",
  5: "Extras"
};
```

* `category` field in each product acts as a **foreign key reference** to this mapping.

---

### 3. UI Requirements

#### 3.1 General

* Mobile-first responsive design
* Clean, simple UI
* Optimized for touch interactions
* Following the same desing as "docs/ui.webp"

#### 3.2 Product Listing

* Display all products grouped or filterable by category
* Each product card must include:

  * Image
  * Name
  * Price
  * Add-to-cart button

#### 3.3 Filtering & Search

* Category filter (tabs, dropdown, or chips)
* Search input:

  * Filters by product name (case-insensitive)

---

### 4. Cart Functionality

#### 4.1 Cart Behavior

* Users can:

  * Add as many products as needed to cart
  * Remove products from cart

* Cart state must be managed in frontend (e.g., React state, localStorage optional)

---

### 5. Export to Excel

#### 5.1 Output Requirement

The main output of the app is an **Excel file (.xlsx)** generated from the cart.

#### 5.2 Excel Format

* Products must be **grouped by category**
* Each row must include:

  * Product Name
  * Quantity
  * Price

#### 5.3 Notes

* Use a frontend library (e.g., `exceljs`) to generate the file
* File should be downloadable by the user

---

### 6. Technical Constraints

* Frontend framework: (recommended) React
* No backend or database
* Static hosting on GitHub Pages
* All logic must run client-side

---

### 7. Suggested Folder Structure

```
/src
  /components
  /pages
  /hooks
  /utils
/data
  products.json
/public
  /images
```

---

### 8. Enhancements

* Add product quantity selector before adding to cart
* Improve Excel formatting (headers, bold categories)
* Add total price per category and overall
