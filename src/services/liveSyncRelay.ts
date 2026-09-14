/**
 * LiveSyncRelay - Universal Real-Time Synchronization Engine
 * 
 * Provides bulletproof real-time sync across devices (phone, laptop, tablet, sanctuary projector, OBS)
 * whether deployed on Vercel, Netlify, Cloud Run, Docker, VPS, or running locally.
 * 
 * Architecture:
 * 1. Cloud Real-time PubSub Relay (Zero-Config, Free, High-Speed SSE + HTTP PubSub via ntfy.sh)
 * 2. Local WebSocket Server (/ws) when running in a Node.js / Docker container
 * 3. Local BroadcastChannel + StorageEvents for 0ms cross-tab/window sync on the same computer
 * 4. Presence heartbeats so Operator & Displays know exact active device counts
 * 5. Automatic cache hydration on startup (new projector/OBS gets current slide instantly)
 */

import {
  saveWorshipStateToFirestore,
  subscribeToFirestoreWorshipState,
  fetchInitialFirestoreWorshipState,
} from './firebase';

export interface SyncMessage {
  msgId: string;
  type: 'init' | 'sync' | 'heartbeat' | 'ping' | 'pong' | 'request_state';
  account: string;
  senderId: string;
  clientType: 'operator' | 'display' | 'stage';
  deviceName?: string;
  state?: any;
  timestamp: number;
}

export interface ConnectedDevice {
  senderId: string;
  clientType: 'operator' | 'display' | 'stage';
  deviceName: string;
  lastSeen: number;
}

export type TransportMode = 'firebase_firestore' | 'websocket' | 'cloud_relay' | 'local_channel' | 'connecting' | 'disconnected';

export class LiveSyncRelay {
  private account: string;
  private clientType: 'operator' | 'display' | 'stage';
  private clientId: string;
  private deviceName: string;
  private topic: string;
  private onStateReceived: (state: any, senderId: string) => void;
  private onCountUpdated: (count: number, devices: ConnectedDevice[]) => void;
  private onStatusChanged: (status: 'connected' | 'connecting' | 'disconnected', transport: TransportMode) => void;
  private onPongReceived?: (latencyMs: number) => void;

  private es: EventSource | null = null;
  private ws: WebSocket | null = null;
  private bc: BroadcastChannel | null = null;
  private unsubscribeFirestore: (() => void) | null = null;
  private isDestroyed = false;
  private activeDevices = new Map<string, ConnectedDevice>();
  private heartbeatTimer: any = null;
  private cleanupDevicesTimer: any = null;
  private lastAppliedTimestamp = 0;
  private pingStartTime = 0;
  private currentTransport: TransportMode = 'connecting';
  private isCloudRelayActive = false;
  private isWsActive = false;
  private isFirestoreActive = false;

  constructor(options: {
    account: string;
    clientType: 'operator' | 'display' | 'stage';
    onStateReceived: (state: any, senderId: string) => void;
    onCountUpdated: (count: number, devices: ConnectedDevice[]) => void;
    onStatusChanged: (status: 'connected' | 'connecting' | 'disconnected', transport: TransportMode) => void;
    onPongReceived?: (latencyMs: number) => void;
  }) {
    this.account = this.sanitizeAccount(options.account);
    this.clientType = options.clientType;
    this.onStateReceived = options.onStateReceived;
    this.onCountUpdated = options.onCountUpdated;
    this.onStatusChanged = options.onStatusChanged;
    this.onPongReceived = options.onPongReceived;

    // Generate persistent client ID for this tab session
    this.clientId = this.getOrCreateClientId();
    this.deviceName = this.resolveDeviceName(options.clientType);
    this.topic = this.buildTopic(this.account);

    this.init();
  }

  private sanitizeAccount(acc: string): string {
    return (acc || 'worship-main').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'worship-main';
  }

  private buildTopic(cleanAccount: string): string {
    // Unique deterministic topic per church account
    return `vvpro_sync_${cleanAccount}_v1`;
  }

  private getOrCreateClientId(): string {
    if (typeof window === 'undefined') return 'server';
    let id = sessionStorage.getItem('worship_client_id');
    if (!id) {
      id = `client_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
      sessionStorage.setItem('worship_client_id', id);
    }
    return id;
  }

  private resolveDeviceName(clientType: 'operator' | 'display' | 'stage'): string {
    if (typeof window === 'undefined') return 'Display Device';
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (clientType === 'operator') return 'Master Operator Desk';
    if (view === 'lowerthird') return 'OBS Lower-Third Stream';
    if (view === 'fullscreen') return 'Sanctuary Fullscreen Projector';
    if (view === 'dual') return 'Dual Output Monitor';
    if (clientType === 'stage') return 'Pastor / Stage Monitor';
    return 'Worship Screen';
  }

  private init() {
    this.initBroadcastChannel();
    this.initFirebaseSync();
    this.startPresenceEngine();
    this.hydrateLatestStateFromCloud();
  }

  /**
   * Firebase Firestore Real-Time Listener
   */
  private initFirebaseSync() {
    try {
      if (this.unsubscribeFirestore) {
        this.unsubscribeFirestore();
        this.unsubscribeFirestore = null;
      }
      this.unsubscribeFirestore = subscribeToFirestoreWorshipState(
        this.account,
        (firestoreState) => {
          if (this.isDestroyed) return;
          const stateTimestamp = Number(firestoreState.lastUpdated || 0);
          if (stateTimestamp && stateTimestamp <= this.lastAppliedTimestamp) return;
          if (stateTimestamp) this.lastAppliedTimestamp = stateTimestamp;
          this.isFirestoreActive = true;
          this.updateOverallStatus();
          this.onStateReceived(firestoreState, 'firebase_firestore');
        },
        () => {
          this.isFirestoreActive = false;
          this.updateOverallStatus();
        }
      );
    } catch (err) {
      console.warn('Firebase Firestore live listener failed to initialize:', err);
    }
  }

  /**
   * 1. Local Browser Tab / Window Sync (0ms latency on same PC)
   */
  private initBroadcastChannel() {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    try {
      this.bc = new BroadcastChannel(`worship_bc_${this.account}`);
      this.bc.onmessage = (event) => {
        if (!event.data || event.data.account !== this.account) return;
        this.handleIncomingMessage(event.data, 'local');
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment', e);
    }
  }

  /**
   * 2. Local WebSocket Server (/ws) - active when running in Node.js / Docker / Cloud Run
   */
  private initLocalWebSocket() {
    if (typeof window === 'undefined') return;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      const socket = new WebSocket(wsUrl);
      this.ws = socket;

      socket.onopen = () => {
        if (this.isDestroyed) {
          socket.close();
          return;
        }
        this.isWsActive = true;
        this.updateOverallStatus();
        socket.send(
          JSON.stringify({
            type: 'join',
            account: this.account,
            clientType: this.clientType,
            clientId: this.clientId,
            deviceName: this.deviceName,
          })
        );
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'sync' || data.type === 'init') {
            if (data.state) {
              this.handleIncomingMessage(
                {
                  msgId: `ws_${Date.now()}`,
                  type: 'sync',
                  account: this.account,
                  senderId: 'server',
                  clientType: 'operator',
                  state: data.state,
                  timestamp: data.state.lastUpdated || Date.now(),
                },
                'ws'
              );
            }
          }
        } catch (e) {}
      };

      socket.onclose = () => {
        this.isWsActive = false;
        this.updateOverallStatus();
      };

      socket.onerror = () => {
        this.isWsActive = false;
        // WebSocket is not supported on Vercel/static hosts.
        // This is completely expected and safe because Cloud Relay handles it!
        this.updateOverallStatus();
      };
    } catch (err) {
      this.isWsActive = false;
      this.updateOverallStatus();
    }
  }

  /**
   * 3. Universal Cloud Real-time PubSub Relay (Zero-Config, Free, Works on Vercel & Any Host)
   */
  private initCloudRelay() {
    if (typeof window === 'undefined' || !('EventSource' in window)) return;

    try {
      if (this.es) {
        this.es.close();
      }

      // Connect to Cloud SSE channel for this specific church account
      const sseUrl = `https://ntfy.sh/${this.topic}/sse`;
      const eventSource = new EventSource(sseUrl);
      this.es = eventSource;

      eventSource.onopen = () => {
        if (this.isDestroyed) {
          eventSource.close();
          return;
        }
        this.isCloudRelayActive = true;
        this.updateOverallStatus();
        // Immediately broadcast joining presence so operator & other displays see this client
        this.broadcastPresence();
        // If this is a display, request the active state in case operator is online
        if (this.clientType !== 'operator') {
          this.requestStateFromPeers();
        }
      };

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event === 'message' && parsed.message) {
            const syncMsg: SyncMessage = JSON.parse(parsed.message);
            if (syncMsg.account === this.account) {
              this.handleIncomingMessage(syncMsg, 'cloud');
            }
          }
        } catch (e) {}
      };

      eventSource.onerror = () => {
        // SSE handles reconnect automatically
        this.updateOverallStatus();
      };
    } catch (err) {
      console.warn('Failed to start Cloud Realtime Relay:', err);
    }
  }

  /**
   * Hydrate latest state from cloud cache (Instant on Vercel / display startup)
   */
  private async hydrateLatestStateFromCloud() {
    try {
      // 1. Fetch persistent state from Firebase Firestore
      const firestoreState = await fetchInitialFirestoreWorshipState(this.account);
      if (firestoreState) {
        this.isFirestoreActive = true;
        this.updateOverallStatus();
        this.onStateReceived(firestoreState, 'firebase_firestore');
      }

      // 2. Try local storage cache for immediate 0ms render
      const localCached = localStorage.getItem(`worship_state_${this.account}`);
      if (localCached) {
        try {
          const parsed = JSON.parse(localCached);
          if (parsed && parsed.lastUpdated > this.lastAppliedTimestamp) {
            this.lastAppliedTimestamp = parsed.lastUpdated;
            this.onStateReceived(parsed, 'local_cache');
          }
        } catch (e) {}
      }

    } catch (err) {
      // Network offline or failed, handled gracefully
    }
  }

  /**
   * Handle incoming message from any transport (deduplicating and filtering self)
   */
  private handleIncomingMessage(msg: SyncMessage, transportSource: 'local' | 'ws' | 'cloud') {
    if (!msg || msg.account !== this.account) return;
    if (msg.senderId === this.clientId) return; // Skip own messages

    // 1. Handle Presence / Heartbeat
    if (msg.type === 'heartbeat') {
      this.activeDevices.set(msg.senderId, {
        senderId: msg.senderId,
        clientType: msg.clientType,
        deviceName: msg.deviceName || 'Remote Device',
        lastSeen: Date.now(),
      });
      this.notifyCountUpdated();
      return;
    }

    // 2. Handle State Request (Displays requesting fresh state from Operator)
    if (msg.type === 'request_state') {
      if (this.clientType === 'operator') {
        const cached = localStorage.getItem(`worship_state_${this.account}`);
        if (cached) {
          try {
            const state = JSON.parse(cached);
            this.broadcastState(state);
          } catch (e) {}
        }
      }
      return;
    }

    // 3. Handle Ping / Pong (Latency check)
    if (msg.type === 'ping') {
      this.sendRawMessage({
        msgId: `pong_${Date.now()}`,
        type: 'pong',
        account: this.account,
        senderId: this.clientId,
        clientType: this.clientType,
        timestamp: Date.now(),
      });
      return;
    }

    if (msg.type === 'pong') {
      if (this.pingStartTime > 0 && this.onPongReceived) {
        const rtt = Math.max(1, Date.now() - this.pingStartTime);
        this.onPongReceived(rtt);
        this.pingStartTime = 0;
      }
      return;
    }

    // 4. Handle State Update
    if (msg.type === 'sync' && msg.state) {
      const msgTime = msg.timestamp || msg.state.lastUpdated || 0;
      if (msgTime > this.lastAppliedTimestamp) {
        this.lastAppliedTimestamp = msgTime;
        // Register device as active
        this.activeDevices.set(msg.senderId, {
          senderId: msg.senderId,
          clientType: msg.clientType,
          deviceName: msg.deviceName || 'Operator Device',
          lastSeen: Date.now(),
        });
        this.notifyCountUpdated();
        this.onStateReceived(msg.state, msg.senderId);
      }
    }
  }

  /**
   * Publish state update to ALL transports (0ms local, Cloud Relay, and WS)
   */
  public broadcastState(stateUpdates: any) {
    const timestamp = Date.now();
    this.lastAppliedTimestamp = timestamp;

    const envelope: SyncMessage = {
      msgId: `msg_${this.clientId}_${timestamp}`,
      type: 'sync',
      account: this.account,
      senderId: this.clientId,
      clientType: this.clientType,
      deviceName: this.deviceName,
      state: {
        ...stateUpdates,
        account: this.account,
        lastUpdated: timestamp,
      },
      timestamp,
    };

    // 1. Broadcast locally to other tabs/windows on this machine (0ms)
    if (this.bc) {
      try {
        this.bc.postMessage(envelope);
      } catch (e) {}
    }

    // 2. Broadcast to local WebSocket if active
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(
          JSON.stringify({
            type: 'update_state',
            account: this.account,
            state: envelope.state,
          })
        );
      } catch (e) {}
    }

    // 3. Broadcast to Cloud Realtime Relay (Vercel & all external devices)
    // 4. Broadcast & Persist state to Firebase Firestore
    saveWorshipStateToFirestore(this.account, envelope.state, this.deviceName);
  }

  /**
   * Request state from online peers
   */
  public requestStateFromPeers() {
    this.sendRawMessage({
      msgId: `req_${Date.now()}`,
      type: 'request_state',
      account: this.account,
      senderId: this.clientId,
      clientType: this.clientType,
      timestamp: Date.now(),
    });
  }

  /**
   * Send test round-trip ping
   */
  public sendPing() {
    this.pingStartTime = Date.now();
    this.sendRawMessage({
      msgId: `ping_${Date.now()}`,
      type: 'ping',
      account: this.account,
      senderId: this.clientId,
      clientType: this.clientType,
      timestamp: Date.now(),
    });
  }

  /**
   * Send presence heartbeat
   */
  private broadcastPresence() {
    this.sendRawMessage({
      msgId: `hb_${Date.now()}`,
      type: 'heartbeat',
      account: this.account,
      senderId: this.clientId,
      clientType: this.clientType,
      deviceName: this.deviceName,
      timestamp: Date.now(),
    });
  }

  /**
   * Send message to cloud relay and local channels
   */
  private sendRawMessage(msg: SyncMessage) {
    if (this.bc) {
      try {
        this.bc.postMessage(msg);
      } catch (e) {}
    }
  }

  private startPresenceEngine() {
    // Send heartbeat every 15s
    this.heartbeatTimer = setInterval(() => {
      if (!this.isDestroyed) {
        this.broadcastPresence();
      }
    }, 60000);

    // Prune inactive devices older than 35s
    this.cleanupDevicesTimer = setInterval(() => {
      const now = Date.now();
      let changed = false;
      for (const [id, dev] of this.activeDevices.entries()) {
        if (now - dev.lastSeen > 35000) {
          this.activeDevices.delete(id);
          changed = true;
        }
      }
      if (changed) {
        this.notifyCountUpdated();
      }
    }, 10000);
  }

  private notifyCountUpdated() {
    const list = Array.from(this.activeDevices.values());
    // Current device is always 1, plus any other active devices
    const totalCount = Math.max(1, list.length + 1);
    this.onCountUpdated(totalCount, list);
  }

  private updateOverallStatus() {
    if (this.isDestroyed) return;

    if (this.isFirestoreActive) {
      this.currentTransport = 'firebase_firestore';
      this.onStatusChanged('connected', 'firebase_firestore');
    } else if (this.isWsActive) {
      this.currentTransport = 'websocket';
      this.onStatusChanged('connected', 'websocket');
    } else if (this.isCloudRelayActive) {
      this.currentTransport = 'cloud_relay';
      this.onStatusChanged('connected', 'cloud_relay');
    } else if (this.bc) {
      this.currentTransport = 'local_channel';
      this.onStatusChanged('connected', 'local_channel');
    } else {
      this.currentTransport = 'disconnected';
      this.onStatusChanged('disconnected', 'disconnected');
    }
  }

  public getTransportMode(): TransportMode {
    return this.currentTransport;
  }

  public getConnectedDevices(): ConnectedDevice[] {
    return Array.from(this.activeDevices.values());
  }

  public switchAccount(newAccount: string) {
    const clean = this.sanitizeAccount(newAccount);
    if (clean === this.account) return;

    this.account = clean;
    this.topic = this.buildTopic(clean);
    this.activeDevices.clear();
    this.lastAppliedTimestamp = 0;

    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
      this.unsubscribeFirestore = null;
    }
    if (this.bc) {
      this.bc.close();
      this.bc = null;
    }
    if (this.es) {
      this.es.close();
      this.es = null;
    }

    this.init();
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.cleanupDevicesTimer) clearInterval(this.cleanupDevicesTimer);
    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
      this.unsubscribeFirestore = null;
    }
    if (this.bc) {
      this.bc.close();
      this.bc = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.es) {
      this.es.close();
      this.es = null;
    }
  }
}
