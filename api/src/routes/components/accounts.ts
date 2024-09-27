export class Account {
  id: bigint;
  accountNumber: bigint;
  balance: number;

  constructor(id: bigint, accountNumber: string, balance: number) {
    this.id = id;
    this.accountNumber = accountNumber;
    this.balance = balance;
  }

  calculateBalance(): number {
    return this.balance;
  }
}

export class CreditCardAccount extends Account {
  interestRate: number;
  maxBalance: number;

  constructor(
    id: bigint,
    accountNumber: bigint,
    balance: number,
    interestRate: number,
    maxBalance: number
  ) {
    super(id, accountNumber, balance);
    this.interestRate = interestRate;
    this.maxBalance = maxBalance;
  }

  calculateBalance(): number {
    // Additional logic for credit card accounts (e.g., interest calculation)
    return this.balance + this.balance * (this.interestRate / 100);
  }
}

export class SavingsAccount extends Account {
  goalBalance: number;

  constructor(
    id: bigint,
    accountNumber: bigint,
    balance: number,
    goalBalance: number
  ) {
    super(id, accountNumber, balance);
    this.goalBalance = goalBalance;
  }

  calculateBalance(): number {
    // Logic for savings accounts (e.g., goal tracking)
    return this.balance;
  }
}

export interface AccountInterface {
  calculateBalance(): number;
}

