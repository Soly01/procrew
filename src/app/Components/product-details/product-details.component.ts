import { LocalStorageService } from './../../../../services/localstorage.service';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../../services/products.service';
import {
  Product,
  TranslatedProduct,
} from '../../../../interface/product.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { LocalStorageKeys } from '../../../../enum/localstorage.enum';
import { LanguageKeys } from './../../../../enum/language.enum';
@Component({
  selector: 'app-product-details',
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
})
export class ProductDetailsComponent implements OnInit {
  product!: TranslatedProduct | null;
  currentLang: string = 'en'; // Default language
  quantity: any;

  private LocalStorageService = inject(LocalStorageService);
  storedProducts =
    this.LocalStorageService.getItem<Product[]>(LocalStorageKeys.products) ||
    [];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductsService,
    private translateService: TranslateService, // Inject TranslateService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    // Get product by ID from route params
    this.route.paramMap.subscribe((params) => {
      const productId = Number(params.get('id'));
      if (productId) {
        this.loadProduct(productId);
      }
    });

    // Listen for language changes
    this.translateService.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
    });

    // Set initial language
    this.currentLang =
      this.translateService.currentLang || LanguageKeys.ENGLISH;
  }

  loadProduct(id: number) {
    this.productService.getProductById(id).subscribe({
      next: (data: TranslatedProduct) => {
        this.product = { ...data };
      },
      error: (err) => {
        console.error('Error fetching product:', err);
        this.product = null;
      },
    });
  }

  getTranslatedText(field: 'name' | 'description' | 'category'): string {
    if (this.product && typeof this.product[field] === 'object') {
      return this.product[field][
        this.currentLang as LanguageKeys.ENGLISH | LanguageKeys.ARABIC
      ];
    }
    return this.product ? String(this.product[field]) : '';
  }
  addToCart(product: any) {
    console.log('Product before adding:', product);

    const originalProduct = this.storedProducts.find(
      (p: { id: any }) => p.id === product.id
    );
    if (!originalProduct) {
      console.error('Product not found in products list:', product);
      return;
    }

    const translatedProduct: Product = {
      id: originalProduct.id,
      name: {
        en:
          typeof originalProduct.name === 'string'
            ? originalProduct.name
            : originalProduct.name?.en || 'Unknown',
        ar:
          typeof originalProduct.name === 'string'
            ? originalProduct.name
            : originalProduct.name?.ar || 'غير معروف',
      },
      description: {
        en:
          typeof originalProduct.description === 'string'
            ? originalProduct.description
            : originalProduct.description?.en || 'No description available',
        ar:
          typeof originalProduct.description === 'string'
            ? originalProduct.description
            : originalProduct.description?.ar || 'لا يوجد وصف',
      },
      category: {
        en:
          typeof originalProduct.category === 'string'
            ? originalProduct.category
            : originalProduct.category?.en || 'Uncategorized',
        ar:
          typeof originalProduct.category === 'string'
            ? originalProduct.category
            : originalProduct.category?.ar || 'غير مصنف',
      },
      price: originalProduct.price,
      stock: originalProduct.stock,
      image: originalProduct.image,
      availability: originalProduct.availability ?? true,
      quantity: product.quantity || 1, // Preserve selected quantity
    };

    console.log('Translated Product:', translatedProduct);

    // Retrieve cart from local storage and ensure it's always an array
    let storedCart: Product[] =
      this.LocalStorageService.getItem<Product[]>(LocalStorageKeys.cart) || [];
    if (!Array.isArray(storedCart)) {
      storedCart = []; // Ensure storedCart is an array
    }

    // Check if product already exists in cart
    const existingProduct = storedCart.find(
      (item) => item.id === translatedProduct.id
    );
    if (existingProduct) {
      existingProduct.quantity += 1;
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Item Added To Cart successfully',
      });
    } else {
      storedCart.push(translatedProduct);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Item Added To Cart successfully',
      });
    }

    // Save updated cart to local storage
    this.LocalStorageService.setItem(
      LocalStorageKeys.cart,
      JSON.parse(JSON.stringify(storedCart))
    ); // Stringify to store correctly

    console.log(
      'Cart after adding:',
      this.LocalStorageService.getItem(LocalStorageKeys.cart)
    ); // Debugging
  }
}
