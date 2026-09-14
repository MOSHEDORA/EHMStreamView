import express from 'express';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory state store per account
interface AccountStore {
  state: Record<string, any>;
  lastUpdated: number;
}

const accountsData = new Map<string, AccountStore>();

function getInitialAccountState(account: string) {
  return {
    account,
    displayMode: 'fullscreen',
    isBlackout: false,
    isClearText: false,
    isLogo: false,
    currentSlide: {
      id: 'welcome-1',
      type: 'lyrics',
      title: 'Welcome to Worship',
      subtitle: 'Sunday Service',
      primaryText: 'Praise the LORD with all your heart;\nSing to Him a new song with joyful shouting.',
      secondaryText: 'యెహోవాను స్తుతించుడి; ఆయనకు క్రొత్త కీర్తన పాడుడి.',
      reference: 'Psalm 33:1-3',
    },
    nextSlide: null,
    alertText: '',
    isAlertVisible: false,
    theme: {
      fontFamily: 'Montserrat',
      fontSize: 44,
      fontColor: '#ffffff',
      fontWeight: 'bold',
      fontItalic: false,
      textTransform: 'none',
      textAlign: 'center',
      textShadow: true,
      textOutline: false,
      lineHeight: 1.35,
      teluguFontFamily: 'Ramabhadra',
      backgroundType: 'motion_waves',
      backgroundColor: '#090d16',
      gradientFrom: '#1e1b4b',
      gradientTo: '#0f172a',
      gradientAngle: 135,
      bgImageUrl: '',
      lowerThirdStyle: 'pill',
      lowerThirdPosition: 'bottom',
      lowerThirdOpacity: 85,
      lowerThirdAccentColor: '#38bdf8',
      showSecondary: false,
      secondaryFontFamily: 'Outfit',
      secondaryFontSize: 24,
      secondaryFontColor: '#cbd5e1',
    },
    activeTab: 'lyrics',
    lastUpdated: Date.now(),
  };
}

function getAccountState(account: string) {
  if (!accountsData.has(account)) {
    accountsData.set(account, {
      state: getInitialAccountState(account),
      lastUpdated: Date.now(),
    });
  }
  return accountsData.get(account)!.state;
}

function updateAccountState(account: string, updates: Record<string, any>) {
  const current = getAccountState(account);
  const updated = {
    ...current,
    ...updates,
    account,
    lastUpdated: Date.now(),
  };
  accountsData.set(account, {
    state: updated,
    lastUpdated: Date.now(),
  });
  return updated;
}

// HTTP API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/state/:account', (req, res) => {
  const account = req.params.account || 'default';
  const state = getAccountState(account);
  res.json({ success: true, state });
});

app.post('/api/state/:account', (req, res) => {
  const account = req.params.account || 'default';
  const updates = req.body || {};
  const updated = updateAccountState(account, updates);
  broadcastToAccount(account, { type: 'sync', state: updated });
  res.json({ success: true, state: updated });
});

app.get('/api/accounts', (req, res) => {
  const list = Array.from(accountsData.keys());
  res.json({ accounts: list });
});

const server = http.createServer(app);

// WebSocket Server attached on /ws
const wss = new WebSocketServer({ server, path: '/ws' });

interface ClientMeta {
  account: string;
  clientType: string;
}

const socketMeta = new Map<WebSocket, ClientMeta>();

function getClientCount(account: string): number {
  let count = 0;
  for (const meta of socketMeta.values()) {
    if (meta.account === account) {
      count++;
    }
  }
  return count;
}

function broadcastToAccount(account: string, message: any, excludeWs?: WebSocket) {
  const payload = JSON.stringify(message);
  for (const [ws, meta] of socketMeta.entries()) {
    if (meta.account === account && ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(payload);
      } catch (err) {
        console.error('Failed to send ws message:', err);
      }
    }
  }
}

wss.on('connection', (ws) => {
  ws.on('message', (rawData) => {
    try {
      const data = JSON.parse(rawData.toString());
      
      if (data.type === 'join') {
        const account = (data.account || 'worship-main').trim().toLowerCase();
        const clientType = data.clientType || 'operator';
        socketMeta.set(ws, { account, clientType });
        
        const currentState = getAccountState(account);
        const count = getClientCount(account);
        
        // Send initial state to the connecting client
        ws.send(JSON.stringify({
          type: 'init',
          state: {
            ...currentState,
            connectedDisplaysCount: count,
          },
        }));

        // Broadcast updated display count to all clients in account
        broadcastToAccount(account, {
          type: 'count_update',
          count,
        });
      } else if (data.type === 'update_state') {
        const meta = socketMeta.get(ws);
        const account = (data.account || meta?.account || 'worship-main').trim().toLowerCase();
        if (data.state) {
          const updated = updateAccountState(account, data.state);
          const count = getClientCount(account);
          broadcastToAccount(account, {
            type: 'sync',
            state: {
              ...updated,
              connectedDisplaysCount: count,
            },
          });
        }
      } else if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (err) {
      console.error('Error processing websocket message:', err);
    }
  });

  ws.on('close', () => {
    const meta = socketMeta.get(ws);
    socketMeta.delete(ws);
    if (meta) {
      const count = getClientCount(meta.account);
      broadcastToAccount(meta.account, {
        type: 'count_update',
        count,
      });
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket connection error:', err);
  });
});

async function initServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Worship Presenter server running on port ${PORT}`);
  });
}

initServer().catch((err) => {
  console.error('Failed to start server:', err);
});
