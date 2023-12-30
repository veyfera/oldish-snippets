import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { categoryList } from '../utils/categories-list';
import { Order, Category } from '../utils/types';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

    private orderUrl:string = "/api/orders";
    private user:string = localStorage.getItem('currentUser') || "";
    private token:string = JSON.parse(this.user).token;
    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json', "Authorization": this.token})
    };

    constructor(
        private http: HttpClient,
        //private messageService: MessageService
    ) { }

  getOrders(): Observable<Order[]> {
      return this.http.get<Order[]>(this.orderUrl, this.httpOptions);
  }

  getCategories(): Category[] {
      return categoryList;
  }

  patchStatus(orderStatus:Category, order:Order): void {
      this.http.patch<Order>(`${this.orderUrl}/${order._id}`, {"status": orderStatus}, this.httpOptions)
      .subscribe();
  }
}
