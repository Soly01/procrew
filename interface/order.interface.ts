import { Product } from './product.interface';

export interface Order {
  id: number;
  userId: number | undefined;
  items: Product[]; // Keep it as Product[] to match cartItems
  date: string;
  status: 'Placed' | 'In Progress' | 'Delivered';
}
