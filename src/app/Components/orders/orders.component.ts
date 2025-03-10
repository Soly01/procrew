import { LanguageService } from './../../services/language.service';
import { LocalStorageService } from './../../services/localstorage.service';
import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Order } from '../../interface/order.interface';
import { User } from '../../interface/user.interface';
import { OrdersService } from '../../services/order.service';
import { LocalStorageKeys } from '../../enum/localstorage.enum';
import { LanguageKeys } from './../../enum/language.enum';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    DropdownModule,
    FormsModule,

    TranslateModule,
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class OrdersComponent implements OnInit, OnDestroy {
  private ordersService = inject(OrdersService);
  private translate = inject(TranslateService);
  private languageService = inject(LanguageService);
  private localStorageService = inject(LocalStorageService);

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loggedInUser: User | null = null;
  currentLang: string = LanguageKeys.ENGLISH;
  ordersSubscription!: Subscription;

  statuses: ('Placed' | 'In Progress' | 'Delivered')[] = [
    'Placed',
    'In Progress',
    'Delivered',
  ];
  translatedStatuses = { Placed: '', 'In Progress': '', Delivered: '' };

  ngOnInit(): void {
    this.currentLang = this.languageService.getLanguage();
    this.loadUser();

    // Subscribe to filtered orders
    this.ordersSubscription = this.ordersService
      .getFilteredOrders(this.loggedInUser?.id, this.loggedInUser?.role ?? '')
      .subscribe((orders) => {
        this.filteredOrders = [...orders]; // ✅ Ensures UI updates properly
      });

    // Listen for language changes
    this.translate.onLangChange.subscribe(() => {
      this.currentLang = this.translate.currentLang;
      this.translateStatuses();
    });

    this.translateStatuses();
  }

  /** Load logged-in user */
  loadUser(): void {
    this.loggedInUser = this.localStorageService.getItem<User>(
      LocalStorageKeys.CURRENTUSER
    );
  }

  /** Translate order statuses */
  translateStatuses(): void {
    this.translatedStatuses = {
      Placed: this.translate.instant('ORDER.STATUS.PLACED'),
      'In Progress': this.translate.instant('ORDER.STATUS.IN_PROGRESS'),
      Delivered: this.translate.instant('ORDER.STATUS.DELIVERED'),
    };
  }

  /** Update order status */
  updateStatus(
    order: Order,
    newStatus: 'Placed' | 'In Progress' | 'Delivered'
  ): void {
    this.ordersService.updateOrderStatus(order.id, newStatus);
  }

  /** Get total price of an order */
  getTotal(order: Order): number {
    return this.ordersService.calculateTotal(order);
  }

  ngOnDestroy(): void {
    if (this.ordersSubscription) this.ordersSubscription.unsubscribe();
  }
}
