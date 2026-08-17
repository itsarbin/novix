import { useRef, useCallback, useEffect } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { io } from 'socket.io-client';
import '@xterm/xterm/css/xterm.css';

/**
 * Wires xterm.js + Socket.IO terminal to the sandbox agent.
 * Terminal init and socket connect are combined into one function
 * to avoid timing races between separate hooks.
 */
export function useTerminal(sandboxId, containerRef) {
  const termRef     = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef   = useRef(null);
  const mountedRef  = useRef(false);
  // disposable from term.onData so we can properly remove it
  const onDataDisposableRef = useRef(null);

  // ── Resize handler ──────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => fitAddonRef.current?.fit();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Main init: create terminal + connect socket ─────────────
  const initialize = useCallback(() => {
    if (!containerRef.current || !sandboxId || mountedRef.current) return;

    // ── 1. Create xterm instance ────────────────────────────
    const term = new Terminal({
      theme: {
        background:          '#0a0b0f',
        foreground:          '#d4d4d8',
        cursor:              '#7c5cfc',
        cursorAccent:        '#0a0b0f',
        selectionBackground: 'rgba(124,92,252,0.3)',
        black:        '#1a1b26', red:     '#f87171',
        green:        '#22d3a5', yellow:  '#fbbf24',
        blue:         '#60a5fa', magenta: '#a78bfa',
        cyan:         '#34d399', white:   '#d4d4d8',
        brightBlack:  '#4a4b58', brightRed:     '#fc8181',
        brightGreen:  '#6ee7b7', brightYellow:  '#fcd34d',
        brightBlue:   '#93c5fd', brightMagenta: '#c4b5fd',
        brightCyan:   '#6ee7b7', brightWhite:   '#f9fafb',
      },
      fontFamily:        "'JetBrains Mono', 'Cascadia Code', monospace",
      fontSize:          13,
      lineHeight:        1.4,
      cursorBlink:       true,
      cursorStyle:       'bar',
      scrollback:        5000,
      allowTransparency: true,
      // Allow the terminal to receive all keyboard input
      allowProposedApi:  true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);

    // Small delay to let the DOM paint before fitting
    requestAnimationFrame(() => {
      try { fitAddon.fit(); } catch (_) { /* ignore fit errors on hidden elements */ }
    });

    termRef.current     = term;
    fitAddonRef.current = fitAddon;
    mountedRef.current  = true;

    term.writeln('\x1b[1;35m  Novix Terminal\x1b[0m');
    term.writeln('\x1b[2m  Connecting to sandbox…\x1b[0m');
    term.writeln('');

    // ── 2. Connect Socket.IO ────────────────────────────────
    const socketUrl = `http://${sandboxId}.agent.localhost`;
    const socket = io(socketUrl, {
      transports:          ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay:   1000,
      timeout:             10000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      term.writeln('\x1b[32m  ✓ Terminal connected\x1b[0m');
      term.writeln('');
    });

    socket.on('disconnect', (reason) => {
      term.writeln(`\x1b[33m\r\n  ⚠ Disconnected: ${reason}\x1b[0m`);
    });

    socket.on('connect_error', (err) => {
      term.writeln(`\x1b[31m  ✗ ${err.message}\x1b[0m`);
    });

    // ── 3. Server → terminal ────────────────────────────────
    socket.on('terminal-output', (data) => {
      if (!termRef.current) return;
      if (typeof data === 'string') {
        termRef.current.write(data);
      } else if (data instanceof Uint8Array || ArrayBuffer.isView(data)) {
        termRef.current.write(new Uint8Array(data));
      } else if (data instanceof ArrayBuffer) {
        termRef.current.write(new Uint8Array(data));
      }
    });

    // ── 4. Terminal → server (keyboard input) ───────────────
    // We register onData AFTER the socket is created so the closure
    // always references the live socket object.
    const disposable = term.onData((data) => {
      if (socket.connected) {
        socket.emit('terminal-input', data);
      } else {
        // Local echo fallback so user sees their keystrokes
        // even if the socket hasn't connected yet
        term.write(data);
      }
    });
    onDataDisposableRef.current = disposable;

    // Focus the terminal so keystrokes work immediately
    term.focus();
  }, [sandboxId, containerRef]);

  // ── Fit / re-focus after panel becomes visible ──────────────
  const fitTerminal = useCallback(() => {
    requestAnimationFrame(() => {
      try { fitAddonRef.current?.fit(); } catch (_) { /* ignore */ }
      termRef.current?.focus();
    });
  }, []);

  // ── Cleanup ─────────────────────────────────────────────────
  const destroy = useCallback(() => {
    onDataDisposableRef.current?.dispose();
    onDataDisposableRef.current = null;
    socketRef.current?.disconnect();
    socketRef.current = null;
    termRef.current?.dispose();
    termRef.current   = null;
    fitAddonRef.current = null;
    mountedRef.current  = false;
  }, []);

  return { initialize, destroy, fitTerminal };
}
