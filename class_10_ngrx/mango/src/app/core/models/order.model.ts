import type { Product } from './product.model';

// A union of string literals instead of an enum: no runtime code is generated, and TypeScript
// still stops you from typing 'PAYED' anywhere an OrderStatus is expected.
export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELED';

export interface OrderItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  // The price is stored per line item: an order must remember what the customer actually paid,
  // even if the product's price changes later.
  price: number;
}

// What the API gives back for an existing order.
export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  // Flat shippingX fields here because that's how the backend stores the row.
  shippingFirstName: string;
  shippingLastName: string;
  shippingStreet: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  // `string | null` means the API always sends the key but it may be empty.
  shippingPhone: string | null;
  // Dates arrive as ISO strings over JSON - convert with new Date(...) or Angular's date pipe.
  createdAt: string;
}

// This interface is the contract for the checkout addressForm: the control names match the keys
// one-to-one, which is why `this.addressForm.value` can be passed straight through.
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  // `phone?` = optional, matching the one control with no Validators.required.
  phone?: string;
}

// The "write" model: only what the client is allowed to send. Notice there's no total or status -
// the server calculates those, so a client can't invent its own price.
export interface CreateOrder {
  items: { productId: number; quantity: number }[];
  shippingAddress: ShippingAddress;
}
