import { LocalStorageService } from './../../../../services/localstorage.service';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Product } from '../../../../interface/product.interface';
import { Order } from '../../../../interface/order.interface';
import { User } from '../../../../interface/user.interface';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-cart',
  imports: [TableModule, CommonModule, ButtonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CartComponent implements OnInit {
  private localStorageService = inject(LocalStorageService);
  private messageService = inject(MessageService);
  cartItems: Product[] = [];
  loggedInUser: User | null = null;
  allOrders: Order[] = [];
  userOrders: Order[] = [];

  ngOnInit(): void {
    this.loadCart();
    this.loadUser();
    this.loadOrders();
  }

  loadUser() {
    this.loggedInUser = this.localStorageService.getItem<User>('currentUser');
  }

  loadCart() {
    const storedCart = this.localStorageService.getItem<Product[]>('cart');
    if (storedCart) {
      this.cartItems = storedCart.map((item) => ({
        ...item,
        quantity: item.quantity || 1,
      }));
    }
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
    this.localStorageService.setItem('cart', this.cartItems);
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

    const newOrder: Order = {
      id: Date.now(),
      userId: loggedInUser?.id,
      items: [...this.cartItems],
      date: new Date().toLocaleString(),
      status: 'Placed',
    };

    const existingOrders: Order[] =
      this.localStorageService.getItem<Order[]>('orders') || [];
    existingOrders.push(newOrder);
    this.localStorageService.setItem('orders', existingOrders);

    this.cartItems = [];
    this.updateCart();

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Order Placed successfully',
    });
  }
}
