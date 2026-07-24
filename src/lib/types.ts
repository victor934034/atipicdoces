export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  cost?: number | null;
  category: string;
  photoUrl: string | null;
  active: boolean;
  order: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
