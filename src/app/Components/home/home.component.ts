import { Component, inject, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ProductsCardComponent } from '../products-card/products-card.component';
import { ProductsService } from '../../../../services/products.service';
import { Product } from '../../../../interface/product.interface';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  imports: [ButtonModule, ProductsCardComponent, RouterLink, TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent {
  products: Product[] = [];

  private productService = inject(ProductsService);
  ngOnInit(): void {
    this.getProducts();
  }
  getProducts() {
    this.productService.getProducts().subscribe((data) => {
      this.products = data;
    });
  }
}
