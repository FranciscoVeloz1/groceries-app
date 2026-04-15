import { useState } from "react";
import { useCategories } from "../hooks/useCategories";
import { SearchBar } from "../components/SearchBar";
import { CategoryCard } from "../components/CategoryCard";
import styles from "./CategoriesPage.module.css";

type Props = {
  onSelectCategory: (categoryId: number) => void;
};

export function CategoriesPage({ onSelectCategory }: Props) {
  const { entries } = useCategories();
  const [search, setSearch] = useState("");

  const filtered = search
    ? entries.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : entries;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Categories</h1>
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search for a category..."
      />
      <div className={styles.grid}>
        {filtered.map((cat) => (
          <CategoryCard
            key={cat.id}
            name={cat.name}
            onClick={() => onSelectCategory(cat.id)}
          />
        ))}
      </div>
    </div>
  );
}
