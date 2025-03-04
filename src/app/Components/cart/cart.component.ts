import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import {
  Product,
  TranslatedProduct,
} from '../../../../interface/product.interface';
import { Order } from '../../../../interface/order.interface';
import { User } from '../../../../interface/user.interface';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../services/language.service';
import { LocalStorageService } from '../../../../services/localstorage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [TableModule, CommonModule, ButtonModule, TranslateModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CartComponent implements OnInit, OnDestroy {
  private localStorageService = inject(LocalStorageService);
  private messageService = inject(MessageService);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);

  cartItems: TranslatedProduct[] = [];
  loggedInUser: User | null = null;
  allOrders: Order[] = [];
  userOrders: Order[] = [];
  langSubscription!: Subscription;
  currentLang: 'en' | 'ar' = 'en';

  ngOnInit(): void {
    const storedLang = this.languageService.getLanguage();
    this.currentLang =
      storedLang === 'en' || storedLang === 'ar' ? storedLang : 'en'; // Ensure valid type

    // Subscribe to language change
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      const newLang = this.translate.currentLang;
      this.currentLang = newLang === 'en' || newLang === 'ar' ? newLang : 'en';
      this.updateCartTranslations(); // Update translations when language changes
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
      this.localStorageService.getItem<TranslatedProduct[]>('cart');
    const storedLang = this.localStorageService.getItem('language');
    const currentLang: 'en' | 'ar' = storedLang === 'ar' ? 'ar' : 'en';

    if (storedCart) {
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
  }

  updateCartTranslations() {
    this.cartItems = this.cartItems.map((item: any) => ({
      ...item,
      name:
        item.name && typeof item.name === 'object'
          ? item.name[this.currentLang] || 'Unknown Product'
          : item.name,
      description:
        item.description && typeof item.description === 'object'
          ? item.description[this.currentLang] || ''
          : item.description,
      category:
        item.category && typeof item.category === 'object'
          ? item.category[this.currentLang] || ''
          : item.category,
    }));
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

  checkout() {
    const loggedInUser: User | null =
      this.localStorageService.getItem<User>('currentUser');

    if (!loggedInUser) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'You must be logged in to place an order.',
      });
      return;
    }

    // Retrieve stored products for correct details
    const storedProducts: Product[] =
      this.localStorageService.getItem<Product[]>('products') || [];

    // Ensure we map the products correctly for the order
    const orderItems = this.cartItems
      .map((cartItem) => {
        const originalProduct = storedProducts.find(
          (product) => product.id === cartItem.id
        );

        if (!originalProduct) {
          console.error('Product not found in stored products:', cartItem);
          return null; // Skip missing products
        }

        return {
          id: originalProduct.id,
          name: originalProduct.name, // Keep multilingual object
          description: originalProduct.description,
          category: originalProduct.category,
          price: originalProduct.price,
          stock: originalProduct.stock,
          image: originalProduct.image,
          availability: originalProduct.availability ?? true,
          quantity: cartItem.quantity || 1, // Use cart quantity
        };
      })
      .filter((item) => item !== null); // Remove any null values

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
      userId: loggedInUser.id,
      items: orderItems as Product[], // Ensure correct type
      date: new Date().toLocaleString(),
      status: 'Placed',
    };

    console.log('New Order:', newOrder);

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

  ngOnDestroy() {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
