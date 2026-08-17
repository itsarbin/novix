import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const TYPE_META = {
  connect: { color: '#22d3a5', label: 'connected' },
  list:    { color: '#60a5fa', label: 'listing' },
  read:    { color: '#a78bfa', label: 'reading' },
  update:  { color: '#fbbf24', label: 'updating' },
  success: { color: '#22d3a5', label: 'done' },
  error:   { color: '#f87171', label: 'error' },
  info:    { color: '#555770', label: 'info' },
};

function ActivityEntry({ entry }) {
  const meta = TYPE_META[entry.type] || TYPE_META.info;
  return (
    <div className="flex items-start gap-2 py-0.5 animate-fade-in">
      <span
        className="text-[10px] font-mono shrink-0 mt-0.5 px-1 rounded"
        style={{
          color: meta.color,
          background: `${meta.color}18`,
        }}
      >
        {meta.label}
      </span>
      <span
        className="text-xs font-mono leading-relaxed break-all"
        style={{ color: 'var(--text-2)' }}
      >
        {entry.text}
      </span>
      <span className="text-[10px] shrink-0 ml-auto" style={{ color: 'var(--text-3)' }}>
        {entry.ts}
      </span>
    </div>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div
      className={`flex gap-2.5 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold"
        style={{
          background: isUser
            ? 'linear-gradient(135deg, #7c5cfc, #5b8af5)'
            : 'rgba(255,255,255,0.07)',
          color: isUser ? '#fff' : '#a78bfa',
          border: isUser ? 'none' : '1px solid rgba(167,139,250,0.3)',
        }}
      >
        {isUser ? 'U' : '✦'}
      </div>

      {/* Bubble */}
      <div
        className="max-w-[82%] rounded-xl px-3 py-2.5"
        style={
          isUser
            ? {
                background: 'linear-gradient(135deg, rgba(124,92,252,0.25), rgba(91,138,245,0.25))',
                border: '1px solid rgba(124,92,252,0.3)',
              }
            : {
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }
        }
      >
        {isUser ? (
          <p className="text-sm" style={{ color: 'var(--text-1)' }}>
            {msg.content}
          </p>
        ) : (
          <div className="prose">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex gap-2.5 animate-fade-in">
      <div
        className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(167,139,250,0.3)',
          color: '#a78bfa',
        }}
      >
        ✦
      </div>
      <div
        className="rounded-xl px-4 py-3"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: '#a78bfa',
                animation: `blink 1.2s ease ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatPanel({ messages, activityLog, isThinking, onSend }) {
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'activity'
  const messagesEndRef = useRef(null);
  const activityEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-switch to activity tab when AI starts working so user sees the stream
  useEffect(() => {
    if (isThinking) {
      setActiveTab('activity');
    } else if (!isThinking && messages.length > 0) {
      // Switch back to chat to show the final response
      setActiveTab('chat');
    }
  }, [isThinking]);

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, activeTab]);

  useEffect(() => {
    if (activeTab === 'activity') {
      activityEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activityLog, activeTab]);

  const handleSend = () => {
    if (!input.trim() || isThinking) return;
    onSend(input.trim());
    setInput('');
    // Don't force tab switch here — the isThinking effect handles it
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const SUGGESTIONS = [
    'Make a calculator app',
    'Create a todo list',
    'Build a landing page',
    'Add a dark mode toggle',
  ];

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--bg-panel)', borderRight: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
            style={{ background: 'rgba(124,92,252,0.2)', color: '#a78bfa' }}
          >
            ✦
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
            AI Assistant
          </span>
          {isThinking && (
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(167,139,250,0.15)',
                color: '#a78bfa',
                border: '1px solid rgba(167,139,250,0.3)',
              }}
            >
              thinking…
            </span>
          )}
        </div>

        {/* Tabs */}
        <div
          className="flex rounded-lg p-0.5 text-xs font-medium"
          style={{ background: 'var(--bg-input)' }}
        >
          {['chat', 'activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-1 rounded-md capitalize transition-all duration-200"
              style={
                activeTab === tab
                  ? {
                      background: 'rgba(124,92,252,0.3)',
                      color: '#c4b5fd',
                    }
                  : { color: 'var(--text-3)' }
              }
            >
              {tab}
              {tab === 'activity' && activityLog.length > 0 && (
                <span
                  className="ml-1 px-1 rounded-full text-[10px]"
                  style={{ background: 'rgba(124,92,252,0.3)', color: '#a78bfa' }}
                >
                  {activityLog.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === 'chat' ? (
          <div className="flex flex-col gap-3 p-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4"
                  style={{
                    background: 'rgba(124,92,252,0.15)',
                    border: '1px solid rgba(124,92,252,0.25)',
                  }}
                >
                  ✦
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-1)' }}>
                  What would you like to build?
                </p>
                <p className="text-xs mb-6" style={{ color: 'var(--text-3)' }}>
                  Describe your idea and AI will generate the code.
                </p>
                <div className="flex flex-col gap-2 w-full">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      className="text-xs px-3 py-2 rounded-lg text-left transition-all duration-200 hover:scale-[1.01]"
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-2)',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <ChatMessage key={i} msg={msg} />
            ))}

            {isThinking && <ThinkingBubble />}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="p-3 flex flex-col gap-0.5">
            {activityLog.length === 0 ? (
              <div
                className="text-center py-8 text-xs"
                style={{ color: 'var(--text-3)' }}
              >
                No activity yet. Send a message to the AI.
              </div>
            ) : (
              activityLog.map((entry, i) => (
                <ActivityEntry key={i} entry={entry} />
              ))
            )}
            <div ref={activityEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <div
          className="flex items-end gap-2 rounded-xl p-2"
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-m)',
          }}
        >
          <textarea
            ref={inputRef}
            id="ai-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build…"
            rows={1}
            disabled={isThinking}
            className="flex-1 bg-transparent text-sm resize-none outline-none min-h-[22px] max-h-[120px] disabled:opacity-50"
            style={{
              color: 'var(--text-1)',
              fontFamily: 'Inter, sans-serif',
              lineHeight: '1.5',
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
          <button
            id="ai-send-btn"
            onClick={handleSend}
            disabled={isThinking || !input.trim()}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
            style={{
              background:
                !isThinking && input.trim()
                  ? 'linear-gradient(135deg, #7c5cfc, #5b8af5)'
                  : 'rgba(255,255,255,0.07)',
              color: '#fff',
            }}
          >
            {isThinking ? (
              <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[10px] mt-1.5 text-center" style={{ color: 'var(--text-3)' }}>
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
