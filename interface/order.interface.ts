import { Product } from './product.interface';

export interface Order {
  id: number;
  userEmail: string; // To attach order to user
  items: Product[];
  date: string;
}
