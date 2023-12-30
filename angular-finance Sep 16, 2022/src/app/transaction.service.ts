import { Injectable } from '@angular/core';
import { transactions, categories } from './mock-data'
import { Transaction, Category } from './types'

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor() { }

  getTransactions(): Transaction[] {
      return transactions.data
  }

  getCategories(): Category[]{
      return categories
  }
}
