import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';
import CodeExample from '@components/code-example';
import { Button } from '~/components/ui/button.js';
import { Card, CardDescription, CardHeader, CardNotes, CardTitle } from '~/components/ui/card.js';
import NASALogo from '~/components/nasa-logo.js';
import DarkModeToggle from '~/components/dark-mode-toggle.js';
import { BookText, Brain, Check } from 'lucide-react';

export function Welcome() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({ api: '/chat' }),
    messages: [
      {
        id: 'msg-1',
        role: 'assistant',
        parts: [{ type: 'text', text: 'Hello! How can I help you today?' }]
      }
    ],
    onError: (error) => {
      console.error('Chat error:', error);
    },
    onFinish: (_options) => {
      // console.log('Chat finished:', options.message);
    }
  });

  return (
    <div className="relative flex flex-col lg:flex-row lg:h-screen overflow-auto">
      <div className="dark:bg-neutral-600" />
      <div className="w-full lg:w-1/2 min-h-0">
        <div className="h-full p-4 sm:p-6 lg:p-8 flex flex-col">
          <div className="mb-10 flex flex-col flex-shrink-0">
            <div className="flex items-start justify-between">
              <h2 className="flex flex-col text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl mb-2 sm:mb-5 break-words">
                <span className="flex items-center mb-1">
                  <NASALogo aria-label="NASA Logo" />
                  <span className="block text-xl font-normal">EED Hackfest 25.4</span>
                </span>
                MCP Playground
              </h2>
              <DarkModeToggle />
            </div>
            <p className="mb-6 font-semibold text-[#1C67E3]">
              Explore how AI and the Model Context Protocol (MCP) can work together. Learn to build useful tools, connect them to real data, and create apps that respond intelligently.
            </p>
            <p className="mb-8">
              When you first start this application, the MCP server has a single tool&mdash;<strong>get_collections</strong>&mdash;which will determine a keyword based on the query, and search the CMR API for collections. You can try it out by searching for something like "get me collections related to sea surface temperature" in the chat window.
            </p>
            <Card>
              <CardHeader>
                <CardTitle>Helpful Links</CardTitle>
                <CardDescription>Here are some helpful links to get you started.</CardDescription>
                <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {
                    [
                      { title: "FastMCP", icon: BookText, description: "Learn about the FastMCP server configuration options and capabilities", href: "https://github.com/jlowin/fastmcp" },
                      { title: "MCP Inspector", icon: BookText, description: "Admin interface allowing inspection of the MCP server", href: "https://github.com/modelcontextprotocol/inspector", notes: "Not currently working with the node MCP" },
                      { title: "MCP 101", icon: BookText, description: "Learn more about MCP concepts and applications", href: "https://thenewstack.io/model-context-protocol-a-primer-for-the-developers/" },
                    ].map((link) => (
                      <a key={link.href} href={link.href}>
                        <Card className="h-full transition-colors hover:bg-accent hover:text-accent-foreground">
                          <CardHeader>
                            <div className="flex flex-col gap-2">
                              <link.icon className="h-5 w-5 text-primary" />
                              <CardTitle>{link.title}</CardTitle>
                            </div>
                            <CardDescription>{link.description}</CardDescription>
                            {
                              link.notes && (
                                <CardNotes>{link.notes}</CardNotes>
                              )
                            }
                          </CardHeader>
                        </Card>
                      </a>
                    ))
                  }
                </ol>
              </CardHeader>
            </Card>
          </div>
          <section className="pb-10">
            <h3 className="flex lg:items-center flex-col lg:flex-row gap-2 text-2xl font-bold tracking-tight mb-5">
              <Brain className="text-primary" />
              Teach the MCP agent some new tricks by adding a tool
            </h3>

            <h4 className="mb-2 font-bold">Add a new tool to the MCP server</h4>
            <p className="mb-4">First, add a new function to the python or node MCP server. This function will return the data to be displayed in the chat response. Below is an example of the get_collections tool in Python.</p>
            <CodeExample
              examples={
                [
                  {
                    title: 'python',
                    description: 'To add a new function to the python MCP server, use the @mcp.tool decorator and give it a function that returns the desired data.',
                    filename: './mcp/fastmcp-python/server.py',
                    content: `@mcp.tool(
  name="get_collections",
  description="Search NASA's Common Metadata Repository (CMR) collection records using full text search.",
  tags={"search"}
)
async def get_collections(keyword: str = '') -> list[DatasetSummary]:
  """Get a list of collections form CMR based on keywords.

  Args:
    keywords: A string of text to search collections with.
  """
  args = {}

  if keyword is not None:
    args['keyword'] = keyword

  collections = earthaccess.search_datasets(count=5,  **args )

  return [format_dataset(ds) for ds in collections]
  `
                      },
                      {
                        title: 'node',
                        description: 'To add a new function to the node MCP server, use the server.addTool() method and give it a function that returns the desired data. Below is an example of the get_collections tool in Node.js',
                        filename: './mcp/fastmcp-node/server.js',
                        content: `server.addTool({
  name: "get_collections",
  description: "Search NASA's Common Metadata Repository (CMR) collection records using full text search.",
  parameters: z.object({
    keyword: z.string().optional().default("")
  }),
  execute: async (args) => {
    try {
      const { keyword } = args;

      // Build CMR API URL
      const baseUrl = "https://cmr.earthdata.nasa.gov/search/collections.json";
      const params = new URLSearchParams();

      // Add keyword parameter if provided
      if (keyword && keyword.trim()) {
        params.append("keyword", keyword.trim());
      }

      // Limit results to 5 (same as Python version)
      params.append("page_size", "5");

      const url = \`$\{baseUrl}?\${params.toString()}\`;

      // Make request to CMR API
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'fastmcp-node/1.0.0'
        }
      });

      const data = response.data;
      const collections = data.feed?.entry || [];

      // Format the results
      const formattedCollections = collections.map(formatDataset);

      return JSON.stringify(formattedCollections);

    } catch (error) {
      console.error("Error searching CMR collections:", error.message);

      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }

      throw new Error(\`Failed to search CMR collections: \${error.message}\`);
    }
  }
});`
                  }
                ]
              }
            />
          </section>
        </div>
      </div>

      <div className="lg:sticky lg:top-0 w-full lg:w-1/2 flex flex-col bg-primary p-10">
        <div className="h-64 lg:flex-1 overflow-y-auto p-4 space-y-4 bg-card">
          {messages.map((message) => {
            const hasToolResults = message.parts.some((part: any) => part.type === 'tool-result' || part.type === 'dynamic-tool');

            return (
              <div key={message.id} className={`${hasToolResults ? 'w-full' : `flex ${(message.role as string) === 'user' ? 'justify-end' : 'justify-start'}`}`}>
                <div className={`${hasToolResults ? 'w-full' : 'max-w-xs lg:max-w-md'} p-4 py-3 ${(message.role as string) === 'user'
                  ? 'bg-[#FC3D21] text-white'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                  }`}>
                  {message.parts.map((part, i) => {
                    switch ((part as any).type) {
                      case 'text':
                        return <p key={`${message.id}-${i}`} className="text-sm whitespace-pre-wrap">{(part as any).text}</p>;
                      case 'tool-call':
                        return (
                          <div key={`${message.id}-${i}`} className="text-sm bg-[#E6EEF9] dark:bg-[#0A1E40] p-2 mt-2">
                            <div className="font-semibold">
                              🔧 Calling {(part as any).toolName}
                            </div>
                            <div className="text-xs mt-1">
                              {JSON.stringify((part as any).args, null, 2)}
                            </div>
                          </div>
                        );
                      case 'tool-result':
                      case 'dynamic-tool':
                        const result = (part as any).result || (part as any).output;
                        let displayResult;

                        try {
                          // Handle different result formats
                          if (typeof result === 'string') {
                            displayResult = JSON.parse(result);
                          } else if (result?.structuredContent) {
                            displayResult = result.structuredContent;
                          } else if (result?.content?.[0]?.text) {
                            displayResult = JSON.parse(result.content[0].text);
                          } else {
                            displayResult = result;
                          }
                        } catch (e) {
                          displayResult = result;
                        }

                        // Render data in a structured, human-readable way
                        const renderData = (data: any): JSX.Element => {
                          if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
                            return <div>{String(data)}</div>;
                          }

                          if (data === null || data === undefined) {
                            return <div className="text-neutral-400">None</div>;
                          }

                          if (Array.isArray(data)) {
                            if (data.length === 0) return <div className="text-neutral-400">Empty list</div>;

                            return (
                              <div className="space-y-3">
                                {data.map((item, idx) => (
                                  <div key={idx} className="border-l-2 border-[#C7D8F1] dark:border-[#0B3D91] pl-3">
                                    {typeof item === 'object' && item !== null ? (
                                      <div className="space-y-1">
                                        {Object.entries(item).map(([k, v]) => (
                                          <div key={k}>
                                            <span className="font-semibold">{k}:</span>{' '}
                                            <span>{String(v)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div>• {String(item)}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          }

                          if (typeof data === 'object' && data !== null) {
                            return (
                              <div className="space-y-2">
                                {Object.entries(data).map(([key, value]) => (
                                  <div key={key}>
                                    <div className="font-semibold mb-1">{key}:</div>
                                    <div className="ml-3">{renderData(value)}</div>
                                  </div>
                                ))}
                              </div>
                            );
                          }

                          return <div>{String(data)}</div>;
                        };

                        return (
                          <div key={`${message.id}-${i}`} className="text-sm mt-2">
                            <div className="flex gap-1 items-center font-semibold bg-green-600 text-white dark:bg-green-900 dark:bg-[#0A1E40] p-2">
                              <Check className="w-5 h-5" /> Result from tool: {(part as any).toolName}
                            </div>
                            <div className="text-neutral-700 dark:text-neutral-300 text-sm mt-2 p-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 max-h-96 overflow-y-auto">
                              {renderData(displayResult)}
                            </div>
                          </div>
                        );
                      default:
                        // Ignore unknown part types like step-start, step-end, etc.
                        return null;
                    }
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-card border-t border-neutral-400 dark:border-neutral-700 p-4">
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) return;
            sendMessage({ text: input });
            setInput('');
          }} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-input focus:outline-none focus:ring-2 focus:ring-[#0B3D91] bg-input"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-6 py-2 bg-[#0B3D91] text-white hover:bg-[#0A3783] focus:outline-none focus:ring-2 focus:ring-[#0B3D91] disabled:bg-neutral-300 disabled:cursor-not-allowed dark:disabled:bg-neutral-600"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
