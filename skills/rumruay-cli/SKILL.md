---
name: rumruay-cli
description: Use when Prame asks to record or query personal finance data with the rumruay CLI (accounts, transactions, net worth, spending).
---

# rumruay CLI (ร่ำรวย)

Terminal interface to the rumruay personal finance ledger. Mirrors the MCP server tools.

## Build & run

```bash
pnpm --filter @rumruay/cli build
pnpm --filter @rumruay/cli start        # or: node apps/cli/dist/index.js
```

Data persists to `~/.rumruay/ledger.json`. Override with `RUMRUAY_DATA=/path/to/file.json` (use this in tests and throwaway checks).

## Commands

| Command | Purpose |
| --- | --- |
| `rumruay account add <id> <name> [--type cash\|bank\|wallet\|credit\|debt\|investment] [--currency THB\|USD\|EUR\|JPY]` | Register an account (default type `bank`, currency `THB`) |
| `rumruay account list` | List accounts with balances |
| `rumruay tx add <accountId> <amount> <category> [--date YYYY-MM-DD] [--note ...]` | Record a transaction (negative = expense, positive = income) |
| `rumruay balance <accountId>` | Account balance |
| `rumruay net-worth` | Assets / liabilities / net worth |
| `rumruay spending [--from YYYY-MM-DD] [--to YYYY-MM-DD]` | Spending by category (defaults: all time) |

## Pitfalls

- **Accounts must exist before transactions**: `tx add` fails on an unknown accountId. Add the account first.
- **Amount sign matters**: income is positive, expenses are negative (e.g. `-1200`).
- **Dates are ISO strings** (`2026-08-15`), compared lexicographically.
- **Currency is per-account**; core throws on cross-currency math.
- For the MCP server (AI-client-facing), see `apps/mcp` — same tools over stdio.
