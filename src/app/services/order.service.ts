import { LocalStorageService } from './localstorage.service';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Order } from '../interface/order.interface';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageKeys } from '../enum/localstorage.enum';
import { LanguageKeys } from '../enum/language.enum';
@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private orders: Order[] = [];
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private currentLang: LanguageKeys.ENGLISH | LanguageKeys.ARABIC =
    LanguageKeys.ENGLISH;
  private LocalStorageService = inject(LocalStorageService);
  constructor(private translate: TranslateService) {
    this.loadOrders();

    // Listen for language changes
    this.translate.onLangChange.subscribe(({ lang }) => {
      this.currentLang = lang as LanguageKeys.ENGLISH | LanguageKeys.ARABIC;
      this.translateOrders();
    });
  }

  /** Load orders from local storage */
  loadOrders() {
    const storedOrders = localStorage.getItem(LocalStorageKeys.ORDERS);
    if (storedOrders) {
      this.orders = JSON.parse(storedOrders);
      this.translateOrders();
    }
  }

  /** Translate orders based on the current language */
  translateOrders(): void {
    const translatedOrders: Order[] = this.orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        name: {
          en: typeof item.name === 'object' ? item.name.en : item.name,
          ar: typeof item.name === 'object' ? item.name.ar : item.name,
        },
        description: {
          en:
            typeof item.description === 'object'
              ? item.description.en
              : item.description,
          ar:
            typeof item.description === 'object'
              ? item.description.ar
              : item.description,
        },
        category: {
          en:
            typeof item.category === 'object'
              ? item.category.en
              : item.category,
          ar:
            typeof item.category === 'object'
              ? item.category.ar
              : item.category,
        },
      })),
    }));

    this.ordersSubject.next(translatedOrders);
  }

  getOrders(): Observable<Order[]> {
    return this.ordersSubject.asObservable();
  }

  addOrder(order: Order) {
    this.orders.push(order);
    this.updateStorage();
  }

  updateOrder(updatedOrder: Order) {
    const index = this.orders.findIndex((o) => o.id === updatedOrder.id);
    if (index !== -1) {
      this.orders[index] = updatedOrder;
      this.updateStorage();
    }
  }

  /** Delete an order */
  deleteOrder(id: number) {
    this.orders = this.orders.filter((o) => o.id !== id);
    this.updateStorage();
  }

  /** Save to local storage and re-translate */
  private updateStorage() {
    this.LocalStorageService.setItem(
      LocalStorageKeys.ORDERS,
      JSON.stringify(this.orders)
    );
    this.translateOrders();
  }
  getFilteredOrders(userId: number | undefined, userRole: string): Order[] {
    if (userRole === LocalStorageKeys.ADMIN) {
      return this.orders;
    }
    return this.orders.filter((order) => order.userId === userId);
  }

  /** Update order status and save to local storage */
  updateOrderStatus(
    orderId: number,
    newStatus: 'Placed' | 'In Progress' | 'Delivered'
  ): void {
    const orderIndex = this.orders.findIndex((order) => order.id === orderId);
    if (orderIndex !== -1) {
      this.orders[orderIndex].status = newStatus;
      this.LocalStorageService.setItem(LocalStorageKeys.ORDERS, this.orders);
      this.translateOrders(); // Ensure updates reflect instantly
    }
  }

  /** Calculate total price of an order */
  calculateTotal(order: Order): number {
    return order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }
}
