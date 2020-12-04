type Transaction = {
  id: number;
  transactionType: string;
  effectiveDate: Date;
  comment?: string;
  lastName: string;
  amount: number;
  newBalance: number;
}

export default Transaction;
