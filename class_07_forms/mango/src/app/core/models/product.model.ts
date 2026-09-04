// A plain TypeScript interface, not an Angular-specific concept - it just describes the shape of data
// flowing through the app so components and templates get type-checking and autocomplete.
export interface Product extends CreateProduct {
  id: number;
}

export interface CreateProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPercent: number;
  image: string;
  images: string[];
  stock: number;
  sku: string;
  categoryId: number;
  featured: boolean;
}
