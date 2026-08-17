import { useRef, useEffect } from 'react';
import { useTerminal } from '../hooks/useTerminal';

export default function TerminalPanel({ sandboxId, isVisible }) {
  const containerRef = useRef(null);
  const { initialize, destroy, fitTerminal } = useTerminal(sandboxId, containerRef);

  // Initialize once when sandboxId is available
  // Panel is always rendered (split layout), so rAF gives real dimensions
  useEffect(() => {
    if (!sandboxId) return;

    const rafId = requestAnimationFrame(() => {
      initialize();
    });

    return () => cancelAnimationFrame(rafId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sandboxId]);

  // Re-fit when panel is shown (parent notifies via isVisible prop)
  useEffect(() => {
    if (isVisible) fitTerminal();
  }, [isVisible, fitTerminal]);

  // Cleanup on unmount
  useEffect(() => {
    return () => destroy();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-3 py-2 shrink-0"
        style={{
          background: 'var(--bg-panel)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f87171' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#fbbf24' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#22d3a5' }} />
        </div>

        <div className="flex items-center gap-2">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: '#22d3a5' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" />
          </svg>
          <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>
            bash
          </span>
        </div>

        {sandboxId && (
          <span
            className="text-xs font-mono ml-auto opacity-40"
            style={{ color: 'var(--text-2)' }}
          >
            {sandboxId.slice(0, 8)}…
          </span>
        )}
      </div>

      {/* xterm mount point — always rendered, never display:none on this element */}
      <div
        ref={containerRef}
        id="terminal-container"
        className="flex-1 min-h-0"
        style={{
          background: '#0a0b0f',
          padding: '6px',
          // Let xterm handle all events inside
          overflow: 'hidden',
        }}
        // Clicking the wrapper focuses the terminal
        onClick={() => {
          // xterm's internal canvas handles focus; this is a safety net
          containerRef.current?.querySelector('.xterm-helper-textarea')?.focus();
        }}
      />
    </div>
  );
}
