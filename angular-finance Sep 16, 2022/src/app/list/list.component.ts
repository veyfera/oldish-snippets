import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { TransactionService } from '../transaction.service';
import { Transaction, Category } from '../types';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  transactions:Transaction[] = [];
  categories:Category[] = [];
  page:number = 0;

  constructor(
    private transactionService: TransactionService,
    private route: ActivatedRoute ) { }

  ngOnInit(): void {
      this.page= Number(this.route.snapshot.queryParamMap.get('page'));
      this.getCategories();
      this.getTransactions();
    }

  getTransactions(): void {
      this.transactions = this.transactionService.getTransactions();
      this.transactions = this.transactions.filter(transaction => transaction.type === this.categories[this.page].searchTerm);
  }

  getCategories(): void {
      this.categories = this.transactionService.getCategories();
  }

  setPageNumber(pageNumber:number): void {
      this.page= pageNumber;
      this.getTransactions();
  }

}
