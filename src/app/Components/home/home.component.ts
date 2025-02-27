import { Component, inject, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ProductsCardComponent } from '../products-card/products-card.component';
import { ProductsService } from '../../../../services/products.service';
import { Product } from '../../../../interface/product.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [ButtonModule, ProductsCardComponent, RouterLink],
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
