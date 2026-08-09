import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';
import http from 'http';

const app = express();
app.use(morgan('combined'));

app.get('/api/status/healthz', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/api/status/readyz', (req, res) => res.status(200).json({ status: 'ok' }));

const proxies = {};
const agentProxies = {};

function getProxy(sandboxId) {
  if (!proxies[sandboxId]) {
    proxies[sandboxId] = createProxyMiddleware({
      target: `http://sandbox-service-${sandboxId}`,
      changeOrigin: true,
      ws: true,
    });
  }
  return proxies[sandboxId];
}

function getAgentProxy(sandboxId) {
  if (!agentProxies[sandboxId]) {
    agentProxies[sandboxId] = createProxyMiddleware({
      target: `http://sandbox-service-${sandboxId}:3000`,
      changeOrigin: true,
      ws: true,
     
    });
  }
  return agentProxies[sandboxId];
}
app.use((req, res, next) => {
  const host = req.headers.host;
  const sandboxId = host.split('.')[0];
  const sub = host.split('.')[1];

  if (sub === 'agent') return getAgentProxy(sandboxId)(req, res, next);
  if (sub === 'preview') return getProxy(sandboxId)(req, res, next);
  next();
});

// --- create the real server yourself, don't rely on app.listen() ---
const server = http.createServer(app);

// Manually forward WebSocket upgrade requests — Express never sees these
server.on('upgrade', (req, socket, head) => {
  const host = req.headers.host;
  console.log('UPGRADE request for host:', host, 'url:', req.url);
  if (!host) return socket.destroy();

  const sandboxId = host.split('.')[0];
  const sub = host.split('.')[1];

  if (sub === 'agent') {
    getAgentProxy(sandboxId).upgrade(req, socket, head);
  } else if (sub === 'preview') {
    getProxy(sandboxId).upgrade(req, socket, head);
  } else {
    socket.destroy();
  }
});

export default server;