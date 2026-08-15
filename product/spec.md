# Repository Specification: `rumruay`

> **Belongs to Product**: [`rumruay`](../../../products/rumruay/prd.md)
> **Repository URL**: [`https://github.com/fromsukong/rumruay`](https://github.com/fromsukong/rumruay)
> **Visibility**: Public
> **Maintainer**: @fromsukong

---

## 1. Description & Scope

`rumruay` (ร่ำรวย — "get rich") is Prame's personal finance toolkit, delivered as an
MCP (Model Context Protocol) server. It gives AI agents a durable, correct way to
track and reason about personal money: income, expenses, account balances, spending
by category, and net worth.

Boundaries:

- **In scope**: money math, ledger/transactions, balances, net worth, spending analysis, MCP tools.
- **Out of scope** (for now): bank integrations, budgeting engine, investment analysis, multi-user.

---

## 2. Tech Stack & Environment

- **Language**: TypeScript (strict, ESM)
- **Package Manager**: pnpm (workspaces monorepo)
- **Runtime**: Node.js >= 18
- **Build**: tsup
- **Lint/Format**: Biome
- **Tests**: Vitest
- **Money math**: decimal.js (no float drift)
- **MCP**: @modelcontextprotocol/sdk (stdio transport), zod schemas

---

## 3. Directory Structure

```
rumruay/
├── product/       # Spec (synced into products-dev via sparse submodule)
├── packages/
│   └── core/      # @rumruay/core — money, ledger, net worth math
├── apps/
│   ├── mcp/       # @rumruay/mcp — MCP server (stdio)
│   └── cli/       # @rumruay/cli — terminal CLI
└── skills/        # Agent-readable operation guides
```

---

## 4. Integration Contracts

- **Products-dev**: registered as a sparse submodule at `products-dev/repos/rumruay` (checks out `product/` only).
- **MCP clients**: connect via stdio; server name `rumruay`, version `0.1.0`.
- **Currency**: THB default, ISO 4217 codes supported by `Money`.
