// A plain TypeScript interface, not an Angular-specific concept - it just describes the shape of data
// flowing through the app so components and templates get type-checking and autocomplete.
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPercent: number;
  image: string;
  stock: number;
  featured: boolean;
}
