// search-filter.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { TranslatedProduct } from '../../interface/product.interface'; // Adjust path

@Pipe({
  name: 'searchFilter',
  standalone: true,
})
export class SearchFilterPipe implements PipeTransform {
  transform(
    products: TranslatedProduct[] | null,
    searchTerm: string
  ): TranslatedProduct[] {
    if (!products || !searchTerm) return products || [];

    const lowerSearch = searchTerm.toLocaleLowerCase();

    return products.filter(
      (product) =>
        (product.name?.toLocaleLowerCase() || '').includes(lowerSearch) ||
        (product.description?.toLocaleLowerCase() || '').includes(
          lowerSearch
        ) ||
        (product.category?.toLocaleLowerCase() || '').includes(lowerSearch)
    );
  }
}
