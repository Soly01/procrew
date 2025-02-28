import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Product } from '../interface/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private apiUrl = '/products.json';
  private products: Product[] = [];
  private productsSubject = new BehaviorSubject<Product[]>([]);

  constructor(private http: HttpClient) {
    this.loadProducts();
  }

  private loadProducts() {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      this.products = JSON.parse(savedProducts);
      this.productsSubject.next(this.products);
    } else {
      this.http.get<Product[]>(this.apiUrl).subscribe((data) => {
        this.products = data;
        localStorage.setItem('products', JSON.stringify(this.products));
        this.productsSubject.next(this.products);
      });
    }
  }

  getProducts(): Observable<Product[]> {
    return this.productsSubject.asObservable();
  }

  addProduct(product: Product) {
    product.id = this.products.length + 1; // Generate a new ID
    this.products.push(product);
    this.updateStorage();
  }

  updateProduct(updatedProduct: Product) {
    const index = this.products.findIndex((p) => p.id === updatedProduct.id);
    if (index !== -1) {
      this.products[index] = updatedProduct;
      this.updateStorage();
    }
  }

  deleteProduct(id: number) {
    this.products = this.products.filter((p) => p.id !== id);
    this.updateStorage();
  }

  private updateStorage() {
    localStorage.setItem('products', JSON.stringify(this.products));
    this.productsSubject.next(this.products);
  }
}
