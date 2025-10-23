// file: action.ts

import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { experimental_createMCPClient, stepCountIs } from 'ai';
// @ts-ignore types are ESM-only in the SDK package
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

/**
 * Cache the MCP client for the process.
 */
let mcpClient: Awaited<ReturnType<typeof experimental_createMCPClient>> | null = null;

async function getMCPClient() {
  if (mcpClient) return mcpClient;

  // Point to your FastMCP Streamable HTTP endpoint
  const transport = new StreamableHTTPClientTransport('http://localhost:5001/mcp');

  mcpClient = await experimental_createMCPClient({ transport });
  return mcpClient;
}

/**
 * Bedrock requires the conversation to start with a user message.
 * Normalize any incoming history accordingly.
 */
function normalizeStartsWithUserUI(msgs: UIMessage[]): UIMessage[] {
  const i = msgs.findIndex((m) => m.role === 'user');
  if (i === -1) throw new Error('Conversation must include a user message (Bedrock requirement).');
  return msgs.slice(i);
}

export const action = async function handler({ request }: { request: Request }) {
  // Parse incoming UI messages from your app
  const { messages }: { messages: UIMessage[] } = await request.json();

  // Ensure Bedrock-friendly ordering
  const normalizedUI = normalizeStartsWithUserUI(messages);
  const modelMessages: Message[] = convertToModelMessages(normalizedUI);

  // Create Bedrock model (Nova Pro example). Region must match your Bedrock region.
  const model = bedrock('us.amazon.nova-pro-v1:0', {
    region: 'us-east-1'
  });

  // Prepare MCP tools
  const client = await getMCPClient();
  const mcpTools = await client.tools();

  // Stream response with MCP tool use enabled
  const result = streamText({
    model,
    messages: modelMessages,
    tools: mcpTools,
    // Limits the number of steps (including tool calls) to 5. Increase this number if your use case requires more tool calls or steps.
    stopWhen: stepCountIs(5),
    // optional: system prompt
    // system: 'You are a helpful assistant.',
  });

  // Return as a streaming response compatible with the AI SDK UI helpers
  return result.toUIMessageStreamResponse({
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'none',
    },
  });
};
