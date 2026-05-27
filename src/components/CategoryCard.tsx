import styles from "./CategoryCard.module.css";

type Props = {
  name: string;
  onClick: () => void;
};

export function CategoryCard({ name, onClick }: Props) {
  return (
    <button className={styles.card} onClick={onClick}>
      <div className={styles.iconWrapper}>
        <span className={styles.emoji}>{getCategoryEmoji(name)}</span>
      </div>
      <span className={styles.name}>{name}</span>
    </button>
  );
}

function getCategoryEmoji(name: string): string {
  const map: Record<string, string> = {
    "Limpieza personal": "\u{1F9F4}",
    "Limpieza global": "\u{1F9F9}",
    "Mascotas": "\u{1F436}",
    "Comida": "\u{1F34E}",
    "Extras": "\u{1F4E6}",
  };
  return map[name] ?? "\u{1F6D2}";
}
