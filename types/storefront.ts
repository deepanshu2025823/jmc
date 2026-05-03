export interface StorefrontProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  images?: string[] | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
