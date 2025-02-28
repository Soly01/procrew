import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '../../interface/product.interface';

@Pipe({
  name: 'searchFilter',
})
export class SearchFilterPipe implements PipeTransform {
  transform(products: Product[] | null, searchText: string): Product[] {
    if (!products) return [];
    if (!searchText) return products;

    searchText = searchText.toLowerCase();
    return products.filter((product) => {
      const match = product.name.toLowerCase().includes(searchText);
      return match;
    });
  }
}
