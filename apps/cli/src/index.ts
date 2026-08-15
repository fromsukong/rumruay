#!/usr/bin/env node
import { type AccountType, type Currency, Ledger, THB } from '@rumruay/core';
import { loadLedger, saveLedger } from './store.js';

const ACCOUNT_TYPES: AccountType[] = ['cash', 'bank', 'wallet', 'credit', 'debt', 'investment'];
const CURRENCIES: Currency[] = ['THB', 'USD', 'EUR', 'JPY'];

function usage(): never {
  console.log(`rumruay (ร่ำรวย) — personal finance CLI

Usage:
  rumruay account add <id> <name> [--type cash|bank|wallet|credit|debt|investment] [--currency THB|USD|EUR|JPY]
  rumruay account list
  rumruay tx add <accountId> <amount> <category> [--date YYYY-MM-DD] [--note ...]
  rumruay balance <accountId>
  rumruay net-worth
  rumruay spending [--from YYYY-MM-DD] [--to YYYY-MM-DD]
  rumruay --help

Data is stored at ~/.rumruay/ledger.json (override with RUMRUAY_DATA).`);
  process.exit(0);
}

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function parseFlag(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] !== undefined ? args[index + 1] : undefined;
}

function main(): void {
  const [cmd, sub, ...rest] = process.argv.slice(2);
  if (cmd === undefined || cmd === '--help' || cmd === '-h' || cmd === 'help') usage();

  const dataPath = process.env.RUMRUAY_DATA ?? undefined;
  const ledger = loadLedger(dataPath);
  const persist = (): void => saveLedger(ledger, dataPath);

  if (cmd === 'account') {
    if (sub === 'add') {
      const [id, name] = rest;
      if (id === undefined || name === undefined)
        fail('Usage: rumruay account add <id> <name> [--type ...] [--currency ...]');
      const type = (parseFlag(rest, '--type') ?? 'bank') as AccountType;
      const currency = (parseFlag(rest, '--currency') ?? 'THB') as Currency;
      if (!ACCOUNT_TYPES.includes(type))
        fail(`Invalid type "${type}". Valid: ${ACCOUNT_TYPES.join(', ')}`);
      if (!CURRENCIES.includes(currency))
        fail(`Invalid currency "${currency}". Valid: ${CURRENCIES.join(', ')}`);
      ledger.addAccount({ id, name, type, currency });
      persist();
      console.log(`✓ Added account "${name}" (${type}, ${currency})`);
    } else if (sub === 'list') {
      if (ledger.accounts.length === 0) {
        console.log('No accounts yet. Add one: rumruay account add wallet Wallet');
      } else {
        for (const account of ledger.accounts) {
          const balance = ledger.balance(account.id);
          console.log(`${account.id.padEnd(16)} ${account.type.padEnd(10)} ${balance.format()}`);
        }
      }
    } else {
      fail('Unknown account subcommand. Try: add, list');
    }
  } else if (cmd === 'tx') {
    if (sub === 'add') {
      const [accountId, amountRaw, category] = rest;
      if (accountId === undefined || amountRaw === undefined || category === undefined) {
        fail(
          'Usage: rumruay tx add <accountId> <amount> <category> [--date YYYY-MM-DD] [--note ...]',
        );
      }
      if (!ledger.accounts.some((a) => a.id === accountId)) {
        fail(
          `Unknown account "${accountId}". Add it first: rumruay account add ${accountId} <name>`,
        );
      }
      const amount = Number(amountRaw);
      if (Number.isNaN(amount)) fail(`Invalid amount "${amountRaw}"`);
      const date = parseFlag(rest, '--date') ?? new Date().toISOString().slice(0, 10);
      const note = parseFlag(rest, '--note');
      ledger.addTransaction({
        id: `tx-${Date.now()}`,
        accountId,
        amount: THB(amount),
        date,
        category,
        ...(note === undefined ? {} : { note }),
      });
      persist();
      console.log(`✓ Recorded ${THB(amount).format()} (${category}) on ${date}`);
    } else {
      fail('Unknown tx subcommand. Try: add');
    }
  } else if (cmd === 'balance') {
    const accountId = sub;
    if (accountId === undefined) fail('Usage: rumruay balance <accountId>');
    console.log(`${accountId} balance: ${ledger.balance(accountId).format()}`);
  } else if (cmd === 'net-worth') {
    const nw = ledger.netWorth();
    console.log(`Assets:      ${nw.assets.format()}`);
    console.log(`Liabilities: ${nw.liabilities.format()}`);
    console.log(`Net worth:   ${nw.netWorth.format()}`);
  } else if (cmd === 'spending') {
    const from = parseFlag(rest, '--from') ?? '0000-01-01';
    const to = parseFlag(rest, '--to') ?? '9999-12-31';
    const byCategory = ledger.spendingByCategory(from, to);
    if (byCategory.size === 0) {
      console.log('No spending in range.');
    } else {
      for (const [cat, money] of [...byCategory.entries()].sort((a, b) =>
        b[1].value.cmp(a[1].value),
      )) {
        console.log(`${cat.padEnd(20)} ${money.format()}`);
      }
    }
  } else {
    fail(`Unknown command "${cmd}". Run "rumruay --help".`);
  }
}

main();
