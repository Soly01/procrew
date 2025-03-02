import { Product } from './product.interface';

export interface Order {
  id: number;
  userId: number | undefined;
  items: Product[];
  date: string;
  status: 'Placed' | 'In Progress' | 'Delivered';
}
