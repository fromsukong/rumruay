import { describe, expect, it } from 'vitest';
import { Ledger, THB } from './index.js';

function makeLedger(): Ledger {
  const ledger = new Ledger();
  ledger.addAccount({ id: 'wallet', name: 'Wallet', type: 'cash', currency: 'THB' });
  ledger.addAccount({ id: 'card', name: 'Credit Card', type: 'credit', currency: 'THB' });
  ledger.addTransaction({
    id: 't1',
    accountId: 'wallet',
    amount: THB(50000),
    date: '2026-08-01',
    category: 'salary',
  });
  ledger.addTransaction({
    id: 't2',
    accountId: 'wallet',
    amount: THB(-1200),
    date: '2026-08-03',
    category: 'food',
  });
  ledger.addTransaction({
    id: 't3',
    accountId: 'card',
    amount: THB(-8000),
    date: '2026-08-05',
    category: 'rent',
  });
  return ledger;
}

describe('Money', () => {
  it('formats THB with grouping and 2 decimals', () => {
    expect(THB(1234.5).format()).toBe('฿1,234.50');
  });

  it('rejects cross-currency math', () => {
    expect(() => THB(1).add(new (THB(1).constructor as never)(1, 'USD') as never)).toThrow(
      /Currency mismatch/,
    );
  });
});

describe('Ledger', () => {
  it('computes account balance', () => {
    const ledger = makeLedger();
    expect(ledger.balance('wallet').format()).toBe('฿48,800.00');
  });

  it('computes net worth as assets minus liabilities', () => {
    const ledger = makeLedger();
    const nw = ledger.netWorth();
    expect(nw.assets.format()).toBe('฿48,800.00');
    expect(nw.liabilities.format()).toBe('฿8,000.00');
    expect(nw.netWorth.format()).toBe('฿40,800.00');
  });

  it('groups spending by category', () => {
    const ledger = makeLedger();
    const byCategory = ledger.spendingByCategory('2026-08-01', '2026-08-31');
    expect(byCategory.get('food')?.format()).toBe('฿1,200.00');
    expect(byCategory.get('rent')?.format()).toBe('฿8,000.00');
  });
});
