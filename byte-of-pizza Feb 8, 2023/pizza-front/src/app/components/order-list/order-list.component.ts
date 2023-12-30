import { Component, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

import { OrdersService } from '../../_services/orders.service';
import { AuthenticationService } from '../../_services/authentification.service';

import { Order, Category } from '../../utils/types';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.sass']
})
export class OrderListComponent implements OnInit {

    categories: Category[] = [];
    selectedCategory: Category = this.categories[0];
    orders:Order[] = [];
    filteredOrders:Order[] = this.orders;

    constructor(
        private router: Router,
        private ordersService: OrdersService,
        private authenticationService: AuthenticationService
    ) { }

  ngOnInit(): void {
    this.getOrders();
    this.getCategories();
  }

  getOrders(): void {
      this.ordersService.getOrders()
      .subscribe(orders => {
        this.orders = orders;
        this.filterOrders();
      });
  }

  getCategories(): void {
    this.categories = this.ordersService.getCategories();
    this.setCategory(this.categories[0]);
  }

  setCategory(category:Category): void {
      this.selectedCategory = category;
      this.filterOrders();
  }

  filterOrders(): void {
      this.filteredOrders = this.orders.filter(o => o.status.value === this.selectedCategory.value);
  }

  logOut(): void {
    this.authenticationService.logout()
    this.router.navigateByUrl("login");
  }

}
