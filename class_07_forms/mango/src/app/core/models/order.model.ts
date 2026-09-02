import type { Product } from './product.model';

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELED';

export interface OrderItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingFirstName: string;
  shippingLastName: string;
  shippingStreet: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingPhone: string | null;
  createdAt: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface CreateOrder {
  items: { productId: number; quantity: number }[];
  shippingAddress: ShippingAddress;
}
