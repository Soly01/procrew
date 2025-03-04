import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from '../services/localstorage.service';
import { MessageService } from 'primeng/api';
import { Product, TranslatedProduct } from '..//interface/product.interface';
import { Order } from '../interface/order.interface';
import { User } from '../interface/user.interface';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  currentLangSubject = new BehaviorSubject<'en' | 'ar'>('en');
  currentLang$ = this.currentLangSubject.asObservable();
  cartItems: TranslatedProduct[] = [];
  loggedInUser: User | null = null;
  allOrders: Order[] = [];
  userOrders: Order[] = [];

  constructor(
    private localStorageService: LocalStorageService,
    private messageService: MessageService,
    private languageService: LanguageService,
    private translate: TranslateService
  ) {
    const storedLang = this.languageService.getLanguage();
    this.currentLangSubject.next(
      storedLang === 'en' || storedLang === 'ar' ? storedLang : 'en'
    );

    // Automatically update translations when the language changes
    this.currentLang$.subscribe((lang) => {
      this.updateCartTranslations(lang);
    });

    this.loadUser();
    this.loadCart();
    this.loadOrders();
  }

  loadUser() {
    this.loggedInUser = this.localStorageService.getItem<User>('currentUser');
  }

  loadCart() {
    const storedCart =
      this.localStorageService.getItem<TranslatedProduct[]>('cart') || [];
    const currentLang = this.currentLangSubject.value;

    this.cartItems = storedCart.map((item) => ({
      ...item,
      name:
        item.name && typeof item.name === 'object'
          ? item.name[currentLang] || 'Unknown Product'
          : item.name,
      description:
        item.description && typeof item.description === 'object'
          ? item.description[currentLang] || 'No description'
          : item.description,
      category:
        item.category && typeof item.category === 'object'
          ? item.category[currentLang] || 'Uncategorized'
          : item.category,
      quantity: item.quantity || 1,
    }));
  }

  updateCart() {
    this.localStorageService.setItem(
      'cart',
      this.cartItems.map((item) => ({
        ...item,
        name: {
          en: item.name,
          ar: item.name,
        },
        description: {
          en: item.description,
          ar: item.description,
        },
        category: {
          en: item.category,
          ar: item.category,
        },
        quantity: item.quantity || 1,
      }))
    );
  }

  removeFromCart(index: number) {
    this.cartItems.splice(index, 1);
    this.updateCart();
  }

  getTotal(): number {
    return this.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  loadOrders() {
    const storedOrders =
      this.localStorageService.getItem<Order[]>('orders') || [];
    this.allOrders = storedOrders;

    if (this.loggedInUser?.role === 'admin') {
      this.userOrders = this.allOrders; // Admin sees all orders
    } else if (this.loggedInUser) {
      this.userOrders = this.allOrders.filter(
        (order) => order.userId === this.loggedInUser!.id
      );
    }
  }

  checkout() {
    if (!this.loggedInUser) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'You must be logged in to place an order.',
      });
      return;
    }

    const storedProducts: Product[] =
      this.localStorageService.getItem<Product[]>('products') || [];

    const orderItems = this.cartItems
      .map((cartItem) => {
        const originalProduct = storedProducts.find(
          (product) => product.id === cartItem.id
        );

        if (!originalProduct) {
          console.error('Product not found in stored products:', cartItem);
          return null;
        }

        return {
          id: originalProduct.id,
          name: originalProduct.name,
          description: originalProduct.description,
          category: originalProduct.category,
          price: originalProduct.price,
          stock: originalProduct.stock,
          image: originalProduct.image,
          availability: originalProduct.availability ?? true,
          quantity: cartItem.quantity || 1,
        };
      })
      .filter((item) => item !== null);

    if (orderItems.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No valid items to place an order.',
      });
      return;
    }

    const newOrder: Order = {
      id: Date.now(),
      userId: this.loggedInUser.id,
      items: orderItems as Product[],
      date: new Date().toLocaleString(),
      status: 'Placed',
    };

    const existingOrders: Order[] =
      this.localStorageService.getItem<Order[]>('orders') || [];
    existingOrders.push(newOrder);
    this.localStorageService.setItem('orders', existingOrders);

    // Clear cart after successful checkout
    this.cartItems = [];
    this.updateCart();

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Order placed successfully',
    });
  }

  updateCartTranslations(lang: 'en' | 'ar') {
    this.cartItems = this.cartItems.map((item) => ({
      ...item,
      name:
        item.name && typeof item.name === 'object'
          ? item.name[lang] || 'Unknown Product'
          : item.name,
      description:
        item.description && typeof item.description === 'object'
          ? item.description[lang] || ''
          : item.description,
      category:
        item.category && typeof item.category === 'object'
          ? item.category[lang] || ''
          : item.category,
    }));
  }

  setLanguage(lang: 'en' | 'ar') {
    this.currentLangSubject.next(lang);
  }
}
