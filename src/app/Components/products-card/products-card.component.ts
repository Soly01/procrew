import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TranslatedProduct } from '../../interface/product.interface';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products-card',
  imports: [
    CardModule,
    ButtonModule,
    RouterLink,
    TranslateModule,
    CommonModule,
  ],
  templateUrl: './products-card.component.html',
  styleUrl: './products-card.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ProductsCardComponent {
  @Input() products!: TranslatedProduct;
}
