import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

// NASA brand palette
// Primary Blue: #0B3D91
// Primary Red:  #FC3D21
// Supporting:   #002244 (deep navy), #E6EEF9 (very light blue)
// Neutral:      #111827 (zinc-900), #F3F4F6 (zinc-100)

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
    <div className="flex flex-col lg:flex-row h-screen p-4 gap-4">
      <div className="w-full lg:w-1/2 min-h-0">
        <div className="h-full bg-gradient-to-br from-[#E6EEF9] via-[#D7E4F6] to-[#C7D8F1] dark:from-[#071326] dark:via-[#0A1E40] dark:to-[#0B3D91] rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 flex flex-col overflow-auto">
          <div className="mb-6 flex-shrink-0">
            <div className="inline-block bg-gradient-to-r from-[#FC3D21] to-[#0B3D91] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4 shadow-lg">
              🚀 Hackfest 2025
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-3 bg-gradient-to-r from-[#0B3D91] via-[#1F5FCC] to-[#3B82F6] bg-clip-text text-transparent break-words">
              NASA
            </h2>
            <h3 className="text-xl sm:text-2xl font-bold text-[#0B3D91] dark:text-[#C7D8F1] mb-2 break-words">
              EED Hackfest 25.4
            </h3>
            <p className="text-xs sm:text-sm text-[#1C3557] dark:text-[#AFC3E8] font-medium">
              Explore how AI and the Model Context Protocol (MCP) can work together. Learn to build useful tools, connect them to real data, and create apps that respond intelligently.
            </p>
          </div>

        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => {
            const hasToolResults = message.parts.some((part: any) => part.type === 'tool-result' || part.type === 'dynamic-tool');

            return (
              <div key={message.id} className={`${hasToolResults ? 'w-full' : `flex ${(message.role as string) === 'user' ? 'justify-end' : 'justify-start'}`}`}>
                <div className={`${hasToolResults ? 'w-full' : 'max-w-xs lg:max-w-md'} px-4 py-2 rounded-lg ${
                  (message.role as string) === 'user'
                    ? 'bg-[#FC3D21] text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}>
                  {message.parts.map((part, i) => {
                    switch ((part as any).type) {
                      case 'text':
                        return <p key={`${message.id}-${i}`} className="text-sm whitespace-pre-wrap">{(part as any).text}</p>;
                      case 'tool-call':
                      return (
                        <div key={`${message.id}-${i}`} className="text-sm bg-[#E6EEF9] dark:bg-[#0A1E40] p-2 rounded mt-2">
                          <div className="font-semibold text-[#0B3D91] dark:text-[#C7D8F1]">
                            🔧 Calling {(part as any).toolName}
                          </div>
                          <div className="text-[#1C3557] dark:text-[#AFC3E8] text-xs mt-1">
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
                          return <div className="text-gray-400">None</div>;
                        }

                        if (Array.isArray(data)) {
                          if (data.length === 0) return <div className="text-gray-400">Empty list</div>;

                          return (
                            <div className="space-y-3">
                              {data.map((item, idx) => (
                                <div key={idx} className="border-l-2 border-[#C7D8F1] dark:border-[#0B3D91] pl-3">
                                  {typeof item === 'object' && item !== null ? (
                                    <div className="space-y-1">
                                      {Object.entries(item).map(([k, v]) => (
                                        <div key={k}>
                                          <span className="font-semibold text-[#1C3557] dark:text-[#AFC3E8]">{k}:</span>{' '}
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
                                  <div className="font-semibold text-[#1C3557] dark:text-[#AFC3E8] mb-1">{key}:</div>
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
                          <div className="font-semibold text-[#0B3D91] dark:text-[#AFC3E8] bg-[#D7E4F6] dark:bg-[#0A1E40] p-2 rounded inline-block">
                            ✅ Result from {(part as any).toolName}
                          </div>
                          <div className="text-gray-700 dark:text-gray-300 text-sm mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
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

        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
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
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] dark:bg-gray-800 dark:text-gray-200"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-6 py-2 bg-[#0B3D91] text-white rounded-lg hover:bg-[#0A3783] focus:outline-none focus:ring-2 focus:ring-[#0B3D91] disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-600"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
