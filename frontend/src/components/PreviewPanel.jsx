import { useState, useRef, useEffect, useCallback } from 'react';

const DEVICE_MODES = [
  { id: 'desktop', icon: '🖥', label: 'Desktop', width: '100%' },
  { id: 'tablet',  icon: '📱', label: 'Tablet',  width: '768px' },
  { id: 'mobile',  icon: '📲', label: 'Mobile',  width: '390px' },
];

export default function PreviewPanel({ previewUrl }) {
  const [deviceMode, setDeviceMode] = useState('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeRef = useRef(null);

  const selectedDevice = DEVICE_MODES.find((d) => d.id === deviceMode);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
  }, []);

  // Auto-refresh when previewUrl changes
  useEffect(() => {
    if (previewUrl) {
      setIsLoading(true);
      setRefreshKey((k) => k + 1);
    }
  }, [previewUrl]);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-base)' }}>
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-3 py-2 shrink-0"
        style={{
          background: 'var(--bg-panel)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5 mr-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f87171' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#fbbf24' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#22d3a5' }} />
        </div>

        {/* URL bar */}
        <div
          className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono"
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            color: 'var(--text-2)',
            minWidth: 0,
          }}
        >
          <svg className="w-3 h-3 shrink-0 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="truncate">{previewUrl || 'No sandbox active'}</span>
          {isLoading && previewUrl && (
            <span
              className="ml-auto w-3 h-3 rounded-full border border-current border-t-transparent animate-spin shrink-0"
              style={{ color: '#a78bfa' }}
            />
          )}
        </div>

        {/* Device toggle */}
        <div
          className="flex items-center rounded-lg p-0.5 gap-0.5"
          style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
        >
          {DEVICE_MODES.map((d) => (
            <button
              key={d.id}
              id={`device-${d.id}`}
              onClick={() => setDeviceMode(d.id)}
              title={d.label}
              className="px-2 py-1 rounded-md text-xs transition-all duration-200"
              style={
                deviceMode === d.id
                  ? {
                      background: 'rgba(124,92,252,0.3)',
                      color: '#c4b5fd',
                    }
                  : { color: 'var(--text-3)' }
              }
            >
              {d.icon}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          id="preview-refresh-btn"
          onClick={handleRefresh}
          title="Refresh preview"
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-white/5"
          style={{ color: 'var(--text-2)' }}
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={isLoading ? { animation: 'spin 0.8s linear infinite' } : {}}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Open external */}
        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-white/5"
            style={{ color: 'var(--text-2)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      {/* Preview area */}
      <div
        className="flex-1 flex items-start justify-center overflow-auto p-4 min-h-0"
        style={{ background: 'var(--bg-base)' }}
      >
        {previewUrl ? (
          <div
            className="relative h-full transition-all duration-500 rounded-xl overflow-hidden"
            style={{
              width: selectedDevice.width,
              maxHeight: '100%',
              boxShadow: '0 8px 48px rgba(0,0,0,0.5)',
              border: '1px solid var(--border)',
            }}
          >
            {isLoading && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center z-10"
                style={{ background: 'var(--bg-panel)' }}
              >
                <div className="relative w-10 h-10 mb-3">
                  <span
                    className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'rgba(124,92,252,0.3)', borderTopColor: '#7c5cfc' }}
                  />
                </div>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                  Loading preview…
                </p>
              </div>
            )}
            <iframe
              key={refreshKey}
              ref={iframeRef}
              src={previewUrl}
              title="Sandbox Preview"
              className="w-full h-full border-0"
              style={{ minHeight: '100%' }}
              onLoad={() => setIsLoading(false)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-3)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>
              Preview will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
