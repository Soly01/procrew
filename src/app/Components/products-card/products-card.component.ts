import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import {
  Product,
  TranslatedProduct,
} from '../../../../interface/product.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-products-card',
  imports: [CardModule, ButtonModule, RouterLink],
  templateUrl: './products-card.component.html',
  styleUrl: './products-card.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ProductsCardComponent {
  @Input() products!: TranslatedProduct;

  ngOnInit(): void {}
  addtoCart() {}
}
