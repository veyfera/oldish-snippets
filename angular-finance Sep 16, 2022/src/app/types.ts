export type Transaction = {
      _id: string
      amount: number
      type: 'income'|'outcome'|'loan'|'investment'
      name: {
        first: string
        last: string
      },
      company: string
      email: string
      phone: string
      address: string
}

export type Transactions = {
    total: number
    data: Transaction[]
}

export type Category = {
    name: string
    searchTerm: string
}
