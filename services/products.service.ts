import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Product, TranslatedProduct } from '../interface/product.interface';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private apiUrl = '/products.json';
  private products: Product[] = [];
  private productsSubject = new BehaviorSubject<TranslatedProduct[]>([]);
  private currentLang: string = 'en';

  constructor(private http: HttpClient, private translate: TranslateService) {
    this.loadProducts();
    this.translate.onLangChange.subscribe(({ lang }) => {
      this.currentLang = lang;
      this.translateProducts();
    });
  }

  loadProducts() {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      this.products = JSON.parse(savedProducts);
      this.translateProducts();
    } else {
      this.http.get<Product[]>(this.apiUrl).subscribe((data) => {
        this.products = data;
        this.translateProducts();
        localStorage.setItem('products', JSON.stringify(this.products));
      });
    }
  }

  translateProducts() {
    const lang = this.translate.currentLang || this.currentLang;

    const translatedProducts: TranslatedProduct[] = this.products.map(
      (product) => ({
        id: product.id,
        name: product.name[lang as keyof Product['name']],
        description: product.description[lang as keyof Product['description']],
        category: product.category[lang as keyof Product['category']],
        price: product.price,
        stock: product.stock,
        image: product.image,
        quantity: product.quantity,
        availability:
          product.stock > 0
            ? this.translate.instant('PRODUCTS.IN_STOCK')
            : this.translate.instant('PRODUCTS.OUT_OF_STOCK'),
      })
    );

    this.productsSubject.next(translatedProducts);
  }

  getProducts(): Observable<TranslatedProduct[]> {
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

  updateStorage() {
    localStorage.setItem('products', JSON.stringify(this.products));
    this.translateProducts(); // Update translation after storage change
  }
}
