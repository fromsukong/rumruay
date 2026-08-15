import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Ledger, THB } from '@rumruay/core';
import { z } from 'zod/v4';

/** Build the rumruay MCP server with a shared ledger instance. */
export function createServer(ledger: Ledger = new Ledger()): McpServer {
  const server = new McpServer({
    name: 'rumruay',
    version: '0.1.0',
  });

  server.tool(
    'add_account',
    'Register a new account (cash, bank, wallet, credit, debt, investment).',
    {
      id: z.string().describe('Unique account id'),
      name: z.string().describe('Human-readable account name'),
      type: z
        .enum(['cash', 'bank', 'wallet', 'credit', 'debt', 'investment'])
        .describe('Account type'),
      currency: z.enum(['THB', 'USD', 'EUR', 'JPY']).default('THB').describe('Currency code'),
    },
    async ({ id, name, type, currency }) => {
      ledger.addAccount({ id, name, type, currency });
      return {
        content: [{ type: 'text', text: `✓ Added account "${name}" (${type}, ${currency})` }],
      };
    },
  );

  server.tool(
    'add_transaction',
    'Record an income/expense transaction into the ledger.',
    {
      id: z.string().describe('Unique transaction id'),
      accountId: z.string().describe('Account this transaction belongs to'),
      amount: z.number().describe('Amount in THB (negative = outflow)'),
      date: z.string().describe('ISO date, e.g. 2026-08-15'),
      category: z.string().describe('Category, e.g. food, rent, salary'),
      note: z.string().optional().describe('Optional note'),
    },
    async ({ id, accountId, amount, date, category, note }) => {
      ledger.addTransaction({
        id,
        accountId,
        amount: THB(amount),
        date,
        category,
        ...(note === undefined ? {} : { note }),
      });
      return {
        content: [{ type: 'text', text: `✓ Recorded ${THB(amount).format()} (${category})` }],
      };
    },
  );

  server.tool(
    'account_balance',
    'Get the current balance of an account.',
    {
      accountId: z.string().describe('Account id'),
    },
    async ({ accountId }) => {
      return {
        content: [
          { type: 'text', text: `${accountId} balance: ${ledger.balance(accountId).format()}` },
        ],
      };
    },
  );

  server.tool(
    'net_worth',
    'Compute assets, liabilities, and net worth across all accounts.',
    {},
    async () => {
      const nw = ledger.netWorth();
      return {
        content: [
          {
            type: 'text',
            text: `Assets: ${nw.assets.format()}\nLiabilities: ${nw.liabilities.format()}\nNet worth: ${nw.netWorth.format()}`,
          },
        ],
      };
    },
  );

  server.tool(
    'spending_by_category',
    'Sum spending (outflows) grouped by category for a date range.',
    {
      from: z.string().describe('Start date, ISO (inclusive)'),
      to: z.string().describe('End date, ISO (inclusive)'),
    },
    async ({ from, to }) => {
      const byCategory = ledger.spendingByCategory(from, to);
      const lines = [...byCategory.entries()]
        .sort((a, b) => b[1].value.cmp(a[1].value))
        .map(([cat, money]) => `${cat}: ${money.format()}`);
      return { content: [{ type: 'text', text: lines.join('\n') || 'No spending in range.' }] };
    },
  );

  return server;
}

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err: unknown) => {
  console.error('rumruay MCP failed:', err);
  process.exit(1);
});
