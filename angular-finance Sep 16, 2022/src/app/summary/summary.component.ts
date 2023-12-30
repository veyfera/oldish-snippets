import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../transaction.service';
import { Transaction, Category } from '../types';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {

  transactions:Transaction[] = [];
  categories:Category[]= [];

  constructor(private transactionService: TransactionService) { }

  ngOnInit(): void {
      this.getTransactions();
      this.getCategories();
  }

  getTransactions(): void {
      this.transactions = this.transactionService.getTransactions();
  }

  getCategories(): void {
      this.categories = this.transactionService.getCategories();
  }

  countTransactionsOfType(type: string): number {
    return this.transactions.filter(transaction => transaction.type === type).length
  }

}
