const TYPE_STYLES = {
  connect: { color: '#22d3a5', icon: '⚡' },
  list:    { color: '#60a5fa', icon: '📂' },
  read:    { color: '#a78bfa', icon: '📖' },
  update:  { color: '#fbbf24', icon: '✏️' },
  success: { color: '#22d3a5', icon: '✓' },
  error:   { color: '#f87171', icon: '✗' },
  info:    { color: '#8b8fa8', icon: '›' },
};

export default function StatusBar({ sandboxId, status, activityLog, isThinking }) {
  const statusColor =
    status === 'ready'    ? '#22d3a5' :
    status === 'starting' ? '#fbbf24' :
    status === 'error'    ? '#f87171' :
    '#555770';

  const statusLabel =
    status === 'ready'    ? 'Running' :
    status === 'starting' ? 'Starting…' :
    status === 'error'    ? 'Error' :
    'Idle';

  return (
    <div
      className="flex items-center justify-between px-4 py-2 text-xs shrink-0"
      style={{
        background: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border)',
        height: '36px',
      }}
    >
      {/* Left: branding + status */}
      <div className="flex items-center gap-4">
        <span
          className="font-bold tracking-wide gradient-text"
          style={{ fontSize: '0.8rem' }}
        >
          NOVIX
        </span>

        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: statusColor,
              boxShadow: status === 'ready' ? `0 0 6px ${statusColor}` : 'none',
            }}
          />
          <span style={{ color: statusColor }}>{statusLabel}</span>
        </div>

        {sandboxId && (
          <span
            className="font-mono opacity-50 truncate max-w-[200px]"
            style={{ color: 'var(--text-2)' }}
            title={sandboxId}
          >
            {sandboxId}
          </span>
        )}
      </div>

      {/* Right: activity indicator */}
      <div className="flex items-center gap-3">
        {isThinking && (
          <div className="flex items-center gap-1.5" style={{ color: '#a78bfa' }}>
            <span
              className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin"
            />
            <span>AI working…</span>
          </div>
        )}

        {activityLog.length > 0 && !isThinking && (
          <span style={{ color: 'var(--text-3)' }}>
            {activityLog[activityLog.length - 1].text.slice(0, 50)}
          </span>
        )}
      </div>
    </div>
  );
}
