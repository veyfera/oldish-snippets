import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Order, Category } from '../../utils/types';

import { OrdersService } from '../../_services/orders.service';

@Component({
  selector: 'app-order-item',
  templateUrl: './order-item.component.html',
  styleUrls: ['./order-item.component.sass']
})
export class OrderItemComponent implements OnInit {
    @Input() order?: Order;
    @Output() changeOrder = new EventEmitter();

    categories: Category[] = [];

    constructor(
        private ordersService: OrdersService,
    ) { }

  ngOnInit(): void {
    this.categories = this.ordersService.getCategories();
  }

  setStatus(e:Event): void {
      const target = e.target as HTMLSelectElement;
      const orderStatus = this.categories.find(c => c.value === target.value)
      if (this.order && orderStatus) {
        this.ordersService.patchStatus(orderStatus, this.order);
        this.order.status = orderStatus;
        this.changeOrder.emit();
      }
  }

}
