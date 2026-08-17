import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createProxyServer } from 'httpxy';
import { refreshTTL } from './config/redis.js';
import morgan from 'morgan';
import http from 'http';

const app = express();

app.use(morgan('combined'));

// -----------------------------
// Health checks
// -----------------------------

app.get('/api/status/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/status/readyz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// -----------------------------
// HTTP proxies
// -----------------------------

const proxies = {};
const agentProxies = {};

function getProxy(sandboxId) {
  if (!proxies[sandboxId]) {
    proxies[sandboxId] = createProxyMiddleware({
      target: `http://sandbox-service-${sandboxId}`,
      changeOrigin: true,

      // IMPORTANT:
      // No ws: true here.
      // WebSockets are handled manually below.
    });
  }

  return proxies[sandboxId];
}

function getAgentProxy(sandboxId) {
  if (!agentProxies[sandboxId]) {
    agentProxies[sandboxId] = createProxyMiddleware({
      target: `http://sandbox-service-${sandboxId}:3000`,
      changeOrigin: true,

      // IMPORTANT:
      // No ws: true here.
      // WebSockets are handled manually below.
    });
  }

  return agentProxies[sandboxId];
}

// -----------------------------
// HTTP routing
// -----------------------------

app.use((req, res, next) => {
  const host = req.headers.host;

  if (!host) {
    return next();
  }

  const hostname = host.split(':')[0];

  const parts = hostname.split('.');

  const sandboxId = parts[0];
  const sub = parts[1];


  refreshTTL(sandboxId).catch((err) => {
    console.error('Error refreshing TTL for sandbox:', sandboxId, err);
  });

  console.log(
    'HTTP request:',
    req.method,
    req.url,
    'sandbox:',
    sandboxId,
    'type:',
    sub
  );

  if (sub === 'agent') {
    return getAgentProxy(sandboxId)(req, res, next);
  }

  if (sub === 'preview') {
    return getProxy(sandboxId)(req, res, next);
  }

  next();
});

// -----------------------------
// Create real HTTP server
// -----------------------------

const server = http.createServer(app);

// -----------------------------
// WebSocket proxy
// -----------------------------

const wsProxy = createProxyServer({
  changeOrigin: true,
});

// Handle WebSocket proxy errors
wsProxy.on('error', (err, req, socket) => {
  console.error('WebSocket proxy error:', err.message);

  socket?.destroy();
});

// -----------------------------
// WebSocket upgrade handling
// -----------------------------

server.on('upgrade', (req, socket, head) => {
  socket.on('error', () => {
    socket.destroy();
  });

  const host = req.headers.host;

  console.log(
    'UPGRADE request:',
    host,
    req.url
  );

  if (!host) {
    return socket.destroy();
  }

  const hostname = host.split(':')[0];

  const parts = hostname.split('.');

  const sandboxId = parts[0];
  const sub = parts[1];

  // -------------------------
  // Agent WebSocket
  // -------------------------

  if (sub === 'agent') {
    console.log(
      'Proxying agent WebSocket to:',
      `http://sandbox-service-${sandboxId}:3000`
    );

    wsProxy
      .ws(
        req,
        socket,
        {
          target: `http://sandbox-service-${sandboxId}:3000`,
        },
        head
      )
      .catch(() => {
        socket.destroy();
      });

    return;
  }

  // -------------------------
  // Preview / Vite WebSocket
  // -------------------------

  if (sub === 'preview') {
    console.log(
      'Proxying preview WebSocket to:',
      `http://sandbox-service-${sandboxId}`
    );

    wsProxy
      .ws(
        req,
        socket,
        {
          target: `http://sandbox-service-${sandboxId}`,
        },
        head
      )
      .catch(() => {
        socket.destroy();
      });

    return;
  }

  // Unknown WebSocket host
  socket.destroy();
});

export default server;