import { useState } from 'react';
import ChatPanel from './ChatPanel';
import PreviewPanel from './PreviewPanel';
import TerminalPanel from './TerminalPanel';
import StatusBar from './StatusBar';
import { useAI } from '../hooks/useAI';

const CHAT_WIDTH = 340;

export default function Workspace({ sandboxId, previewUrl, onReset }) {
  // Split ratio: how much of the center goes to Preview (rest to Terminal)
  const [previewFlex, setPreviewFlex] = useState(60); // percent
  const { messages, activityLog, isThinking, sendMessage } = useAI(sandboxId);

  const handleDrag = (e) => {
    // Simple drag-to-resize: listen on the divider
    e.preventDefault();
    const startY   = e.clientY;
    const startFlex = previewFlex;
    const container = e.currentTarget.parentElement;
    const totalH    = container.clientHeight;

    const onMove = (me) => {
      const delta = ((me.clientY - startY) / totalH) * 100;
      setPreviewFlex(Math.min(85, Math.max(20, startFlex + delta)));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* ── Status bar ── */}
      <StatusBar
        sandboxId={sandboxId}
        status="ready"
        activityLog={activityLog}
        isThinking={isThinking}
      />

      {/* ── Top nav ── */}
      <div
        className="flex items-center gap-2 px-3 h-10 shrink-0"
        style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-sm font-bold gradient-text mr-2">Novix</span>

        {/* Panel labels */}
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-3)' }}>
          <span className="flex items-center gap-1">
            <span>🖥</span> Preview
          </span>
          <span style={{ color: 'var(--border-m)' }}>+</span>
          <span className="flex items-center gap-1">
            <span>💻</span> Terminal
          </span>
        </div>

        <div className="flex-1" />

        {/* Sandbox ID badge */}
        {sandboxId && (
          <span
            className="font-mono text-xs px-2 py-0.5 rounded-md"
            style={{
              background: 'rgba(124,92,252,0.1)',
              color: '#a78bfa',
              border: '1px solid rgba(124,92,252,0.25)',
            }}
            title={sandboxId}
          >
            {sandboxId.slice(0, 8)}…
          </span>
        )}

        {/* Reset */}
        <button
          id="reset-sandbox-btn"
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all duration-200 hover:bg-white/5"
          style={{ color: 'var(--text-3)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m0 14v1m8-8h-1M5 12H4m14.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" />
          </svg>
          New Sandbox
        </button>
      </div>

      {/* ── Main layout: Chat | Preview+Terminal ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left: Chat Panel */}
        <div
          className="shrink-0 flex flex-col min-h-0"
          style={{ width: `${CHAT_WIDTH}px` }}
        >
          <ChatPanel
            messages={messages}
            activityLog={activityLog}
            isThinking={isThinking}
            onSend={sendMessage}
          />
        </div>

        {/* Right: Vertical split — Preview (top) + Terminal (bottom) */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden">

          {/* Preview panel */}
          <div
            className="min-h-0 overflow-hidden"
            style={{ flex: `${previewFlex} 0 0`, borderBottom: '1px solid var(--border)' }}
          >
            <PreviewPanel previewUrl={previewUrl} />
          </div>

          {/* Draggable divider */}
          <div
            className="shrink-0 flex items-center justify-center cursor-row-resize select-none group"
            style={{
              height: '6px',
              background: 'var(--bg-panel)',
              borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
            }}
            onMouseDown={handleDrag}
          >
            <div
              className="w-16 h-0.5 rounded-full transition-all group-hover:w-24"
              style={{ background: 'var(--border-m)' }}
            />
          </div>

          {/* Terminal panel — always visible so xterm has real dimensions */}
          <div
            className="min-h-0 overflow-hidden"
            style={{ flex: `${100 - previewFlex} 0 0` }}
          >
            <TerminalPanel
              sandboxId={sandboxId}
              isVisible={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
