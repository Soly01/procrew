import { LocalStorageService } from './../../services/localstorage.service';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { Product, TranslatedProduct } from '../../interface/product.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { LocalStorageKeys } from '../../enum/localstorage.enum';
import { LanguageKeys } from './../../enum/language.enum';
@Component({
  selector: 'app-product-details',
  imports: [CommonModule, FormsModule, ButtonModule, TranslateModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
})
export class ProductDetailsComponent implements OnInit {
  product!: TranslatedProduct | null;
  currentLang: string = 'en'; // Default language
  quantity: any;

  private LocalStorageService = inject(LocalStorageService);
  private route = inject(ActivatedRoute);
  private productService = inject(ProductsService);
  private translate = inject(TranslateService);
  private messageService = inject(MessageService);
  storedProducts =
    this.LocalStorageService.getItem<Product[]>(LocalStorageKeys.PRODUCTS) ||
    [];
  currentRole = this.LocalStorageService.getItem(LocalStorageKeys.CURRENTROLE);
  constructor() {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const productId = Number(params.get('id'));
      if (productId) {
        this.loadProduct(productId);
      }
    });

    // Listen for language changes
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
    });

    // Set initial language
    this.currentLang = this.translate.currentLang || LanguageKeys.ENGLISH;
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
    const currentUser = this.LocalStorageService.getItem<any>(
      LocalStorageKeys.CURRENTUSER
    );

    if (!currentUser || !currentUser.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Login Required',
        detail: 'Please log in to add items to the cart.',
      });
      return;
    }

    console.log('Product before adding:', product);

    const originalProduct = this.storedProducts.find(
      (p) => p.id === product.id
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
      quantity: product.quantity || 1,
    };

    console.log('Translated Product:', translatedProduct);

    // Retrieve entire cart object from local storage (containing carts for all users)
    let allCarts =
      this.LocalStorageService.getItem<any>(LocalStorageKeys.CART) || {};

    // Ensure the current user has a cart initialized
    if (!allCarts[currentUser.id]) {
      allCarts[currentUser.id] = [];
    }

    // Find user's cart
    let userCart = allCarts[currentUser.id];

    // Check if product already exists in the user's cart
    const existingProduct = userCart.find(
      (item: any) => item.id === translatedProduct.id
    );
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      userCart.push(translatedProduct);
    }

    // Save updated user cart back into the cart object
    allCarts[currentUser.id] = userCart;

    // Save updated carts back to local storage
    this.LocalStorageService.setItem(LocalStorageKeys.CART, allCarts);

    // Show success message
    this.translate
      .get(['MESSAGES.SUCCESS', 'MESSAGES.ADD_TO_CART_SUCCESS'])
      .subscribe((translations) => {
        this.messageService.add({
          severity: 'success',
          summary: translations['MESSAGES.SUCCESS'],
          detail: translations['MESSAGES.ADD_TO_CART_SUCCESS'],
        });
      });

    console.log(
      'Updated Cart:',
      this.LocalStorageService.getItem(LocalStorageKeys.CART)
    );
  }
}
