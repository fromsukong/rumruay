import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Ledger, THB } from '@rumruay/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { fromSnapshot, loadLedger, saveLedger, toSnapshot } from './store.js';

const dir = mkdtempSync(path.join(tmpdir(), 'rumruay-test-'));
const dataPath = path.join(dir, 'ledger.json');

beforeAll(() => {
  process.env.RUMRUAY_DATA = dataPath;
});

afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

function sampleLedger(): Ledger {
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

describe('store round-trip', () => {
  it('serializes and deserializes a ledger without losing data', () => {
    const original = sampleLedger();
    const restored = fromSnapshot(toSnapshot(original));
    expect(restored.accounts).toHaveLength(2);
    expect(restored.transactions).toHaveLength(3);
    expect(restored.balance('wallet').format()).toBe('฿48,800.00');
    expect(restored.netWorth().netWorth.format()).toBe('฿40,800.00');
  });

  it('saves to disk and reloads identically', () => {
    const original = sampleLedger();
    saveLedger(original, dataPath);
    const reloaded = loadLedger(dataPath);
    expect(reloaded.transactions).toHaveLength(3);
    expect(reloaded.balance('wallet').format()).toBe('฿48,800.00');
  });

  it('returns an empty ledger when no data file exists', () => {
    const empty = loadLedger(path.join(dir, 'missing.json'));
    expect(empty.accounts).toHaveLength(0);
    expect(empty.transactions).toHaveLength(0);
  });
});
