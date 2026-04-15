export type Product = {
  id: number;
  name: string;
  image: string;
  category: number;
  price: number;
};

export type CategoryId = 1 | 2 | 3 | 4 | 5;

export type Categories = Record<CategoryId, string>;
