import { LocalStorageService } from './localstorage.service';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Order } from '../interface/order.interface';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageKeys } from '../enum/localstorage.enum';
import { LanguageKeys } from '../enum/language.enum';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private orders: Order[] = [];
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private currentLang: LanguageKeys.ENGLISH | LanguageKeys.ARABIC =
    LanguageKeys.ENGLISH;

  private localStorageService = inject(LocalStorageService);

  constructor(private translate: TranslateService) {
    this.loadOrders();
    this.translate.onLangChange.subscribe(({ lang }) => {
      this.currentLang = lang as LanguageKeys.ENGLISH | LanguageKeys.ARABIC;
      this.translateOrders();
    });
  }

  /** Load orders from local storage */
  private loadOrders(): void {
    const storedOrders = this.localStorageService.getItem<Order[]>(
      LocalStorageKeys.ORDERS
    );
    if (storedOrders) {
      this.orders = storedOrders;
      this.translateOrders();
    }
  }

  /** Translate orders based on the current language */
  private translateOrders(): void {
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

    this.ordersSubject.next([...translatedOrders]); // ✅ Emit a new array reference
  }

  /** Get the orders as an observable */
  getOrders(): Observable<Order[]> {
    return this.ordersSubject.asObservable();
  }

  /** Add a new order */
  addOrder(order: Order): void {
    this.orders.push(order);
    this.updateStorage();
  }

  /** Update an existing order */
  updateOrder(updatedOrder: Order): void {
    const index = this.orders.findIndex((o) => o.id === updatedOrder.id);
    if (index !== -1) {
      this.orders[index] = updatedOrder;
      this.updateStorage();
    }
  }

  /** Delete an order */
  deleteOrder(id: number): void {
    this.orders = this.orders.filter((o) => o.id !== id);
    this.updateStorage();
  }

  /** Save to local storage and emit updates */
  private updateStorage(): void {
    this.localStorageService.setItem(LocalStorageKeys.ORDERS, this.orders);
    this.ordersSubject.next([...this.orders]); // ✅ Ensures change detection
  }

  /** Get filtered orders as an observable */
  getFilteredOrders(
    userId: number | undefined,
    userRole: string
  ): Observable<Order[]> {
    return this.ordersSubject
      .asObservable()
      .pipe(
        map((orders) =>
          userRole === LocalStorageKeys.ADMIN
            ? orders
            : orders.filter((order) => order.userId === userId)
        )
      );
  }

  /** Update order status */
  updateOrderStatus(
    orderId: number,
    newStatus: 'Placed' | 'In Progress' | 'Delivered'
  ): void {
    const orderIndex = this.orders.findIndex((order) => order.id === orderId);
    if (orderIndex !== -1) {
      this.orders[orderIndex].status = newStatus;
      this.updateStorage();
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
