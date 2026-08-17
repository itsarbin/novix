import { useState, useCallback } from 'react';
import { startSandbox as apiStart } from '../lib/api';

/**
 * Manages the sandbox lifecycle.
 * status: 'idle' | 'starting' | 'ready' | 'error'
 */
export function useSandbox() {
  const [status, setStatus] = useState('idle');
  const [sandboxId, setSandboxId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  const startSandbox = useCallback(async () => {
    setStatus('starting');
    setError(null);
    try {
      const data = await apiStart();
      setSandboxId(data.sandboxId);
      setPreviewUrl(data.previewUrl);
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setSandboxId(null);
    setPreviewUrl(null);
    setError(null);
  }, []);

  return { status, sandboxId, previewUrl, error, startSandbox, reset };
}
