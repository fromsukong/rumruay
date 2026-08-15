import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const SERVER_PATH = new URL('../dist/index.js', import.meta.url).pathname;

let transport: StdioClientTransport;
let client: Client;

beforeAll(async () => {
  transport = new StdioClientTransport({
    command: process.execPath,
    args: [SERVER_PATH],
  });
  client = new Client({ name: 'rumruay-test', version: '0.0.0' });
  await client.connect(transport);
});

afterAll(async () => {
  await client.close();
});

describe('rumruay MCP server (stdio round-trip)', () => {
  it('lists the expected tools', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      'account_balance',
      'add_account',
      'add_transaction',
      'net_worth',
      'spending_by_category',
    ]);
  });

  it('records a transaction and reflects it in net worth', async () => {
    await client.callTool({
      name: 'add_account',
      arguments: { id: 'wallet', name: 'Wallet', type: 'cash', currency: 'THB' },
    });
    await client.callTool({
      name: 'add_transaction',
      arguments: {
        id: 'smoke-1',
        accountId: 'wallet',
        amount: 25000,
        date: '2026-08-15',
        category: 'salary',
      },
    });
    const result = await client.callTool({
      name: 'net_worth',
      arguments: {},
    });
    const content = Array.isArray(result.content) ? result.content : [result.content];
    const text = content[0]?.type === 'text' ? content[0].text : '';
    expect(text).toContain('Assets: ฿25,000.00');
  });
});
