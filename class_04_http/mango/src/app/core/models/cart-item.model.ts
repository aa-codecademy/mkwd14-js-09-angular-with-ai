import type { Product } from './product.model';

// Pairs a Product with a quantity - CartService stores an array of these rather than raw Products,
// since the cart needs to track "how many" of each item separately from the product catalog itself.
export interface CartItem {
  product: Product;
  quantity: number;
}
