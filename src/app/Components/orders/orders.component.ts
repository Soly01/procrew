import { LanguageService } from './../../services/language.service';
import { LocalStorageService } from './../../services/localstorage.service';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { Timeline } from 'primeng/timeline';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Order } from '../../interface/order.interface';
import { User } from '../../interface/user.interface';
import { OrdersService } from '../../services/order.service';
import { LocalStorageKeys } from '../../enum/localstorage.enum';
import { LanguageKeys } from './../../enum/language.enum';
@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    DropdownModule,
    FormsModule,
    Timeline,
    TranslateModule,
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class OrdersComponent implements OnInit {
  private ordersService = inject(OrdersService);
  private translate = inject(TranslateService);
  private languageService = inject(LanguageService);
  private localStorageService = inject(LocalStorageService);

  orders: Order[] = [];
  loggedInUser: User | null = null;
  currentLang: string = LanguageKeys.ENGLISH;
  translatedStatuses = {
    Placed: '',
    'In Progress': '',
    Delivered: '',
  };

  statuses: ('Placed' | 'In Progress' | 'Delivered')[] = [
    'Placed',
    'In Progress',
    'Delivered',
  ];

  ngOnInit(): void {
    this.currentLang = this.languageService.getLanguage();

    this.loadUser();
    this.loadOrders();
    this.translateStatuses();

    this.translate.onLangChange.subscribe(() => {
      this.currentLang = this.translate.currentLang;
      this.loadOrders(); // Reload orders with translation
      this.translateStatuses();
    });
  }

  loadUser(): void {
    this.loggedInUser = this.localStorageService.getItem<User>(
      LocalStorageKeys.CURRENTUSER
    );
  }

  loadOrders(): void {
    this.ordersService.getOrders().subscribe((orders) => {
      this.orders = orders;
    });
  }

  translateStatuses(): void {
    this.translatedStatuses = {
      Placed: this.translate.instant('ORDER.STATUS.PLACED'),
      'In Progress': this.translate.instant('ORDER.STATUS.IN_PROGRESS'),
      Delivered: this.translate.instant('ORDER.STATUS.DELIVERED'),
    };
  }

  get filteredOrders(): Order[] {
    return this.loggedInUser
      ? this.ordersService.getFilteredOrders(
          this.loggedInUser.id,
          this.loggedInUser.role
        )
      : [];
  }

  updateStatus(
    order: Order,
    newStatus: 'Placed' | 'In Progress' | 'Delivered'
  ): void {
    this.ordersService.updateOrderStatus(order.id, newStatus);
  }

  getTotal(order: Order): number {
    return this.ordersService.calculateTotal(order);
  }
}
