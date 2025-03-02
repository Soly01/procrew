import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { Order } from '../../../../interface/order.interface';
import { LocalStorageService } from '../../../../services/localstorage.service';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { Timeline } from 'primeng/timeline';
import { User } from '../../../../interface/user.interface';

@Component({
  selector: 'app-orders',
  imports: [TableModule, CommonModule, DropdownModule, FormsModule, Timeline],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class OrdersComponent implements OnInit {
  private localStorageService = inject(LocalStorageService);

  orders: Order[] = [];
  loggedInUser: User | null = null;
  statuses = ['Placed', 'In Progress', 'Delivered'];

  ngOnInit(): void {
    this.loadUser();
    this.loadOrders();
  }

  // Load the logged-in user
  loadUser(): void {
    this.loggedInUser = this.localStorageService.getItem<User>('currentUser');
  }

  // Load orders from local storage
  loadOrders(): void {
    const storedOrders = this.localStorageService.getItem<Order[]>('orders');
    if (storedOrders) {
      this.orders = storedOrders;
    }
  }

  // Get orders based on user role
  get filteredOrders(): Order[] {
    if (this.loggedInUser?.role === 'admin') {
      return this.orders; // Admin sees all orders
    }
    return this.orders.filter(
      (order) => order.userId === this.loggedInUser?.id
    );
  }

  // Update order status and save to local storage
  updateStatus(
    order: Order,
    newStatus: 'Placed' | 'In Progress' | 'Delivered'
  ): void {
    order.status = newStatus;
    this.localStorageService.setItem('orders', this.orders);
  }

  // Calculate total price of an order
  getTotal(order: Order): number {
    return order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }
}
