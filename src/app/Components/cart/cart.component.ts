import { OrdersService } from './../../services/order.service';
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
import { Product, TranslatedProduct } from '../../interface/product.interface';
import { Order } from '../../interface/order.interface';
import { User } from '../../interface/user.interface';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { LocalStorageService } from '../../services/localstorage.service';
import { Subscription } from 'rxjs';
import { LocalStorageKeys } from '../../enum/localstorage.enum';
import { LanguageKeys } from '../../enum/language.enum';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    ButtonModule,
    TranslateModule,
    FormsModule,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CartComponent implements OnInit, OnDestroy {
  private localStorageService = inject(LocalStorageService);
  private OrdersService = inject(OrdersService);
  private messageService = inject(MessageService);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);

  cartItems: TranslatedProduct[] = [];
  loggedInUser: User | null = null;
  allOrders: Order[] = [];
  userOrders: Order[] = [];
  langSubscription!: Subscription;
  currentLang: LanguageKeys.ENGLISH | LanguageKeys.ARABIC =
    LanguageKeys.ENGLISH;

  ngOnInit(): void {
    this.currentLang =
      this.languageService.getLanguage() || LanguageKeys.ENGLISH;

    // Subscribe to language change
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.currentLang = this.translate.currentLang as LanguageKeys;
      this.updateCartTranslations();
    });

    this.loadUser();
    this.loadCart();
    this.loadOrders();
  }

  loadUser() {
    this.loggedInUser = this.localStorageService.getItem<User>(
      LocalStorageKeys.CURRENTUSER
    );
  }

  loadCart() {
    if (!this.loggedInUser) return;

    const allCarts =
      this.localStorageService.getItem<Record<number, TranslatedProduct[]>>(
        LocalStorageKeys.CART
      ) || {};
    const storedCart = allCarts[this.loggedInUser.id] || [];

    const storedLang = this.localStorageService.getItem(
      LocalStorageKeys.LANGUAGE
    );
    const currentLang: LanguageKeys.ENGLISH | LanguageKeys.ARABIC =
      storedLang === LanguageKeys.ARABIC
        ? LanguageKeys.ARABIC
        : LanguageKeys.ENGLISH;

    this.cartItems = storedCart.map((item) => ({
      ...item,
      name: typeof item.name === 'object' ? item.name[currentLang] : item.name,
      description:
        typeof item.description === 'object'
          ? item.description[currentLang]
          : item.description,
      category:
        typeof item.category === 'object'
          ? item.category[currentLang]
          : item.category,
    }));
  }

  updateCartTranslations() {
    this.cartItems = this.cartItems.map((item) => ({
      ...item,
      name:
        typeof item.name === 'object'
          ? item.name[this.currentLang] || 'Unknown Product'
          : item.name,
      description:
        typeof item.description === 'object'
          ? item.description[this.currentLang] || ''
          : item.description,
      category:
        typeof item.category === 'object'
          ? item.category[this.currentLang] || ''
          : item.category,
    }));
  }

  updateCart() {
    if (!this.loggedInUser) return;

    let allCarts =
      this.localStorageService.getItem<Record<number, TranslatedProduct[]>>(
        LocalStorageKeys.CART
      ) || {};

    allCarts[this.loggedInUser.id] = this.cartItems.map((item) => ({
      ...item,
      quantity: item.quantity > 0 ? item.quantity : 1, // Ensure quantity is at least 1
    }));

    this.localStorageService.setItem(LocalStorageKeys.CART, allCarts);
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
      this.localStorageService.getItem<Order[]>(LocalStorageKeys.ORDERS) || [];
    this.allOrders = storedOrders;

    if (this.loggedInUser?.role === LocalStorageKeys.ADMIN) {
      this.userOrders = this.allOrders;
    } else if (this.loggedInUser) {
      this.userOrders = this.allOrders.filter(
        (order) => order.userId === this.loggedInUser!.id
      );
    }
  }

  checkout() {
    if (!this.loggedInUser) return;

    const storedProducts: Product[] =
      this.localStorageService.getItem<Product[]>(LocalStorageKeys.PRODUCTS) ||
      [];

    const orderItems = this.cartItems
      .map((cartItem) => {
        const originalProduct = storedProducts.find(
          (product) => product.id === cartItem.id
        );
        if (!originalProduct) return null;

        return {
          ...originalProduct,
          quantity: cartItem.quantity > 0 ? cartItem.quantity : 1, // Prevent quantity from being 0
        };
      })
      .filter((item) => item !== null) as Product[];

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
      items: orderItems,
      date: new Date().toLocaleString(),
      status: 'Placed',
    };

    console.log('New Order:', newOrder);

    const existingOrders =
      this.localStorageService.getItem<Order[]>(LocalStorageKeys.ORDERS) || [];
    existingOrders.push(newOrder);
    this.localStorageService.setItem(LocalStorageKeys.ORDERS, existingOrders);

    // ✅ Emit the new order to update `OrdersComponent`
    this.OrdersService.addOrder(newOrder);

    // Clear only the current user's cart
    let allCarts =
      this.localStorageService.getItem<Record<number, TranslatedProduct[]>>(
        LocalStorageKeys.CART
      ) || {};
    allCarts[this.loggedInUser.id] = [];
    this.localStorageService.setItem(LocalStorageKeys.CART, allCarts);

    this.cartItems = [];

    this.translate
      .get(['MESSAGES.SUCCESS', 'MESSAGES.CHECKOUT_SUCCESS'])
      .subscribe((translations) => {
        this.messageService.add({
          severity: 'success',
          summary: translations['MESSAGES.SUCCESS'],
          detail: translations['MESSAGES.CHECKOUT_SUCCESS'],
        });
      });
  }

  ngOnDestroy() {
    this.langSubscription?.unsubscribe();
  }
}
