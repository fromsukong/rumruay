import { type Currency, Money } from './money.js';

export type AccountType = 'cash' | 'bank' | 'wallet' | 'credit' | 'debt' | 'investment';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: Currency;
}

export interface Transaction {
  id: string;
  /** Account this transaction belongs to. */
  accountId: string;
  /** Negative = outflow, positive = inflow. */
  amount: Money;
  /** ISO date, e.g. "2026-08-15". */
  date: string;
  category: string;
  note?: string;
}

export interface NetWorthBreakdown {
  assets: Money;
  liabilities: Money;
  netWorth: Money;
}

/** In-memory ledger. Storage-backed implementations can replace it later. */
export class Ledger {
  readonly accounts: Account[] = [];
  readonly transactions: Transaction[] = [];

  addAccount(account: Account): void {
    this.accounts.push(account);
  }

  addTransaction(tx: Transaction): void {
    this.transactions.push(tx);
  }

  /** Net flow (inflow − outflow) for an account over all time. */
  balance(accountId: string): Money {
    return this.transactions
      .filter((tx) => tx.accountId === accountId)
      .reduce((sum, tx) => sum.add(tx.amount), new Money(0, this.currencyOf(accountId)));
  }

  /** Balance within a date range (inclusive). */
  balanceBetween(accountId: string, from: string, to: string): Money {
    return this.transactions
      .filter((tx) => tx.accountId === accountId && tx.date >= from && tx.date <= to)
      .reduce((sum, tx) => sum.add(tx.amount), new Money(0, this.currencyOf(accountId)));
  }

  /** Spending (outflow) grouped by category for a date range. */
  spendingByCategory(from: string, to: string): Map<string, Money> {
    const currency = this.currencyOf(this.accounts[0]?.id ?? '');
    const outflows = this.transactions.filter(
      (tx) => tx.amount.isNegative && tx.date >= from && tx.date <= to,
    );
    const byCategory = new Map<string, Money>();
    for (const tx of outflows) {
      const current = byCategory.get(tx.category) ?? new Money(0, currency);
      byCategory.set(tx.category, current.add(tx.amount.abs()));
    }
    return byCategory;
  }

  /** Assets minus liabilities, grouped by account type. */
  netWorth(): NetWorthBreakdown {
    const currency = this.currencyOf(this.accounts[0]?.id ?? '');
    let assets = new Money(0, currency);
    let liabilities = new Money(0, currency);
    for (const account of this.accounts) {
      const balance = this.balance(account.id);
      if (account.type === 'credit' || account.type === 'debt') {
        liabilities = liabilities.add(balance.abs());
      } else {
        assets = assets.add(balance);
      }
    }
    return { assets, liabilities, netWorth: assets.subtract(liabilities) };
  }

  currencyOf(accountId: string): Currency {
    return this.accounts.find((a) => a.id === accountId)?.currency ?? 'THB';
  }
}
