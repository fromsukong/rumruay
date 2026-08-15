import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { type Account, Ledger, THB, type Transaction } from '@rumruay/core';

/** Serializable snapshot of a Ledger. */
export interface LedgerSnapshot {
  accounts: Array<Pick<Account, 'id' | 'name' | 'type' | 'currency'>>;
  transactions: Array<{
    id: string;
    accountId: string;
    amount: string;
    date: string;
    category: string;
    note?: string;
  }>;
}

export function toSnapshot(ledger: Ledger): LedgerSnapshot {
  return {
    accounts: ledger.accounts.map(({ id, name, type, currency }) => ({ id, name, type, currency })),
    transactions: ledger.transactions.map((tx) => ({
      id: tx.id,
      accountId: tx.accountId,
      amount: tx.amount.value.toString(),
      date: tx.date,
      category: tx.category,
      ...(tx.note === undefined ? {} : { note: tx.note }),
    })),
  };
}

export function fromSnapshot(snapshot: LedgerSnapshot): Ledger {
  const ledger = new Ledger();
  for (const account of snapshot.accounts) {
    ledger.addAccount({ ...account });
  }
  for (const tx of snapshot.transactions) {
    const transaction: Transaction = {
      id: tx.id,
      accountId: tx.accountId,
      amount: THB(tx.amount),
      date: tx.date,
      category: tx.category,
      ...(tx.note === undefined ? {} : { note: tx.note }),
    };
    ledger.addTransaction(transaction);
  }
  return ledger;
}

/** Default data file location (~/.rumruay/ledger.json). */
export function defaultDataPath(): string {
  const home = process.env.HOME ?? process.cwd();
  return `${home}/.rumruay/ledger.json`;
}

export function loadLedger(path = defaultDataPath()): Ledger {
  try {
    const raw = readFileSync(path, 'utf8');
    return fromSnapshot(JSON.parse(raw) as LedgerSnapshot);
  } catch {
    return new Ledger();
  }
}

export function saveLedger(ledger: Ledger, path = defaultDataPath()): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(toSnapshot(ledger), null, 2)}\n`, 'utf8');
}
