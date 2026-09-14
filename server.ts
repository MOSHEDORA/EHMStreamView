import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent Data Paths
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'registered_users.json');
const STATES_FILE = path.join(DATA_DIR, 'account_states.json');
const STATS_FILE = path.join(DATA_DIR, 'app_stats.json');

export const APP_VERSION = 'v2.6.4';
export const APP_DESIGNER = 'Designed by Moshe Dora from EHM, Kakinada';

interface AppStatsStore {
  totalUsersUsed: number;
  knownVisitors: string[];
  lastUpdated: number;
}

function loadStatsStore(): AppStatsStore {
  ensureDataDir();
  try {
    if (fs.existsSync(STATS_FILE)) {
      const raw = fs.readFileSync(STATS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.totalUsersUsed === 'number') {
        return {
          totalUsersUsed: parsed.totalUsersUsed,
          knownVisitors: Array.isArray(parsed.knownVisitors) ? parsed.knownVisitors : [],
          lastUpdated: parsed.lastUpdated || Date.now(),
        };
      }
    }
  } catch (e) {
    console.error('Failed to load stats store:', e);
  }
  return {
    totalUsersUsed: 1248,
    knownVisitors: [],
    lastUpdated: Date.now(),
  };
}

function saveStatsStore(stats: AppStatsStore) {
  ensureDataDir();
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save stats store:', e);
  }
}

let appStatsStore: AppStatsStore = loadStatsStore();
const activeHeartbeats = new Map<string, number>();

function getLiveUsersCount(): number {
  const now = Date.now();
  for (const [id, ts] of activeHeartbeats.entries()) {
    if (now - ts > 45000) {
      activeHeartbeats.delete(id);
    }
  }
  const wsCount = typeof wss !== 'undefined' && wss ? wss.clients.size : 0;
  return Math.max(1, Math.max(wsCount, activeHeartbeats.size));
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// User Model Interface
interface ServerUser {
  id: string;
  name: string;
  email: string;
  password: string;
  churchName: string;
  role: string;
  accountSlug: string;
  createdAt: number;
}

const INITIAL_USERS: ServerUser[] = [
  {
    id: 'user-moshe',
    name: 'Moshe Ravi',
    email: 'moshe.ravikampadu@gmail.com',
    password: 'worship2026',
    churchName: 'Grace Community Church',
    role: 'Lead AV Director',
    accountSlug: 'mosheravikampadu',
    createdAt: 1710000000000,
  },
  {
    id: 'user-faith-church',
    name: 'Worship Leader',
    email: 'leader@church.org',
    password: 'password123',
    churchName: 'Faith Fellowship Church',
    role: 'Worship Director',
    accountSlug: 'faithchurch',
    createdAt: 1710000000000,
  },
];

function loadUsers(): ServerUser[] {
  ensureDataDir();
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load registered users from disk:', e);
  }
  saveUsers(INITIAL_USERS);
  return INITIAL_USERS;
}

function saveUsers(userList: ServerUser[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(userList, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write registered users to disk:', e);
  }
}

let registeredUsers: ServerUser[] = loadUsers();

function getSlugFromEmail(email: string): string {
  return (
    email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '') || 'worship-main'
  );
}

// In-memory state store per account
interface AccountStore {
  state: Record<string, any>;
  lastUpdated: number;
}

function loadAccountStates(): Map<string, AccountStore> {
  ensureDataDir();
  const map = new Map<string, AccountStore>();
  try {
    if (fs.existsSync(STATES_FILE)) {
      const data = fs.readFileSync(STATES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        for (const [key, val] of Object.entries(parsed)) {
          map.set(key, val as AccountStore);
        }
      }
    }
  } catch (e) {
    console.error('Failed to load account states from disk:', e);
  }
  return map;
}

function saveAccountStates(map: Map<string, AccountStore>) {
  ensureDataDir();
  try {
    const obj: Record<string, any> = {};
    for (const [k, v] of map.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(STATES_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save account states to disk:', e);
  }
}

const accountsData = loadAccountStates();

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
    saveAccountStates(accountsData);
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
  saveAccountStates(accountsData);
  return updated;
}

// HTTP API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Analytics & Footer Statistics: App Version, Designer, Live Users & Cumulative New Users
app.get('/api/analytics/stats', (req, res) => {
  res.json({
    success: true,
    version: APP_VERSION,
    designer: APP_DESIGNER,
    totalLiveUsers: getLiveUsersCount(),
    totalUsersUsed: appStatsStore.totalUsersUsed,
    lastUpdated: appStatsStore.lastUpdated,
  });
});

app.post('/api/analytics/visit', (req, res) => {
  const { visitorId } = req.body || {};
  const cleanId = String(visitorId || '').trim();
  let isNew = false;
  if (cleanId && !appStatsStore.knownVisitors.includes(cleanId)) {
    appStatsStore.knownVisitors.push(cleanId);
    appStatsStore.totalUsersUsed += 1;
    appStatsStore.lastUpdated = Date.now();
    saveStatsStore(appStatsStore);
    isNew = true;
  }
  if (cleanId) {
    activeHeartbeats.set(cleanId, Date.now());
  }
  const liveCount = getLiveUsersCount();
  broadcastAll({
    type: 'stats_update',
    totalLiveUsers: liveCount,
    totalUsersUsed: appStatsStore.totalUsersUsed,
    version: APP_VERSION,
  });
  res.json({
    success: true,
    isNew,
    version: APP_VERSION,
    designer: APP_DESIGNER,
    totalLiveUsers: liveCount,
    totalUsersUsed: appStatsStore.totalUsersUsed,
  });
});

app.post('/api/analytics/heartbeat', (req, res) => {
  const { visitorId } = req.body || {};
  const cleanId = String(visitorId || '').trim();
  if (cleanId) {
    activeHeartbeats.set(cleanId, Date.now());
  }
  const liveCount = getLiveUsersCount();
  res.json({
    success: true,
    totalLiveUsers: liveCount,
    totalUsersUsed: appStatsStore.totalUsersUsed,
    version: APP_VERSION,
  });
});

// Auth Routes: Real-time multi-device account management
app.get('/api/auth/users', (req, res) => {
  res.json({
    success: true,
    users: getPublicUsersList(),
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, churchName, role } = req.body || {};
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (name || '').trim();
  const cleanChurch = (churchName || '').trim() || `${cleanName}'s Ministry`;
  const cleanRole = (role || '').trim() || 'Lead AV Director';
  const cleanPassword = String(password || '');

  if (!cleanName) {
    return res.status(400).json({
      success: false,
      error: 'Please enter your full name or operator name.',
      errorType: 'invalid_input',
    });
  }

  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email address (e.g. name@church.org).',
      errorType: 'invalid_input',
    });
  }

  if (!cleanPassword || cleanPassword.length < 4) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 4 characters long.',
      errorType: 'invalid_input',
    });
  }

  const existing = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(409).json({
      success: false,
      error: `An account with email "${cleanEmail}" already exists! Please click "Sign In" instead.`,
      errorType: 'user_already_exists',
    });
  }

  const accountSlug = getSlugFromEmail(cleanEmail);
  const newUser: ServerUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    email: cleanEmail,
    password: cleanPassword,
    churchName: cleanChurch,
    role: cleanRole,
    accountSlug,
    createdAt: Date.now(),
  };

  registeredUsers = [newUser, ...registeredUsers];
  saveUsers(registeredUsers);

  // Initialize state for this account room if not present
  getAccountState(accountSlug);

  const session = {
    churchName: newUser.churchName,
    accountName: accountSlug,
    operatorName: newUser.name,
    role: newUser.role,
    isLoggedIn: true,
    loginTime: Date.now(),
  };

  // Broadcast to all connected clients across all devices in real time!
  broadcastAll({
    type: 'users_updated',
    users: getPublicUsersList(),
    newAccount: accountSlug,
  });

  res.json({
    success: true,
    user: newUser,
    session,
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = String(password || '');

  if (!cleanEmail) {
    return res.status(400).json({
      success: false,
      error: 'Please enter your email address.',
      errorType: 'invalid_input',
    });
  }

  if (!cleanPass) {
    return res.status(400).json({
      success: false,
      error: 'Please enter your password.',
      errorType: 'invalid_input',
    });
  }

  const user = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: `User not found! No registered account exists for "${cleanEmail}". Please check your email or click Register to create a new account.`,
      errorType: 'user_not_found',
    });
  }

  if (user.password !== cleanPass) {
    return res.status(401).json({
      success: false,
      error: `Incorrect password! The password you entered for "${cleanEmail}" is not correct. Please try again.`,
      errorType: 'wrong_password',
    });
  }

  const session = {
    churchName: user.churchName,
    accountName: user.accountSlug,
    operatorName: user.name,
    role: user.role,
    isLoggedIn: true,
    loginTime: Date.now(),
  };

  res.json({
    success: true,
    user,
    session,
  });
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

function getPublicUsersList() {
  return registeredUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    churchName: u.churchName,
    role: u.role,
    accountSlug: u.accountSlug,
    createdAt: u.createdAt,
    password: u.password,
    onlineDevices: getClientCount(u.accountSlug),
  }));
}

function broadcastAll(message: any) {
  const payload = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
      } catch (err) {
        console.error('Failed to broadcast to client:', err);
      }
    }
  }
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
  // Send current registered users list immediately upon connection
  try {
    ws.send(JSON.stringify({
      type: 'users_updated',
      users: getPublicUsersList(),
    }));
    ws.send(JSON.stringify({
      type: 'stats_update',
      totalLiveUsers: getLiveUsersCount(),
      totalUsersUsed: appStatsStore.totalUsersUsed,
      version: APP_VERSION,
    }));
  } catch (err) {}

  // Broadcast updated live count to all connected clients
  broadcastAll({
    type: 'stats_update',
    totalLiveUsers: getLiveUsersCount(),
    totalUsersUsed: appStatsStore.totalUsersUsed,
    version: APP_VERSION,
  });

  ws.on('message', (rawData) => {
    try {
      const data = JSON.parse(rawData.toString());
      
      if (data.type === 'get_users') {
        ws.send(JSON.stringify({
          type: 'users_updated',
          users: getPublicUsersList(),
        }));
      } else if (data.type === 'join') {
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

        // Broadcast user list with updated onlineDevices count
        broadcastAll({
          type: 'users_updated',
          users: getPublicUsersList(),
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
      broadcastAll({
        type: 'users_updated',
        users: getPublicUsersList(),
      });
    }
    broadcastAll({
      type: 'stats_update',
      totalLiveUsers: getLiveUsersCount(),
      totalUsersUsed: appStatsStore.totalUsersUsed,
      version: APP_VERSION,
    });
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
