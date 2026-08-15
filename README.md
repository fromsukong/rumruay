# rumruay (ร่ำรวย)

> **Belongs to Product**: [`rumruay`](https://github.com/fromsukong/products-dev/blob/main/products/rumruay/prd.md)
> **Repository URL**: [`https://github.com/fromsukong/rumruay`](https://github.com/fromsukong/rumruay)
> **Visibility**: Public
> **Maintainer**: @fromsukong

---

## Description

**rumruay (ร่ำรวย — "get rich")** is Prame's personal finance toolkit, built as an
[MCP](https://modelcontextprotocol.io) server so AI agents can manage money the same
way humans do: track income/expenses, watch account balances, and see net worth
grow over time.

The repo is a **pnpm monorepo**:

- [`@rumruay/core`](packages/core) — domain logic: money (decimal.js), ledger, balances, net worth
- [`@rumruay/mcp`](packages/mcp) — the MCP server exposing finance tools over stdio

## Quick Start

```bash
pnpm install
pnpm build
pnpm test
```

## Run the MCP server

```bash
pnpm --filter @rumruay/mcp build
pnpm --filter @rumruay/mcp start
```

Then point any MCP client (Claude, Cursor, Hermes…) at it:

```json
{
  "mcpServers": {
    "rumruay": {
      "command": "node",
      "args": ["/path/to/rumruay/packages/mcp/dist/index.js"]
    }
  }
}
```

## Add a new package

```bash
pnpm new <package-name>   # scaffolds packages/<name> as @rumruay/<name>
```

## Structure

```
rumruay/
├── product/              # Product spec (tracked via products-dev sparse submodule)
│   └── spec.md           # Repository specification
├── packages/
│   ├── core/             # @rumruay/core — money, ledger, net worth math
│   └── mcp/              # @rumruay/mcp — MCP server (stdio)
└── scripts/
    └── new-package.mjs   # Package scaffolder (@rumruay scope)
```

Created from [`repo-template`](https://github.com/fromsukong/repo-template).
