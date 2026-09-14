import { useState, useEffect, useRef, useCallback } from 'react';
import { WorshipState } from '../types';
import { DEFAULT_STATE } from '../data/defaultSettings';

export function useWorshipSync(initialAccount: string = 'worship-main', clientType: 'operator' | 'display' | 'stage' = 'operator') {
  const [account, setAccount] = useState<string>(() => {
    // Check URL parameters first
    const params = new URLSearchParams(window.location.search);
    const accParam = params.get('account');
    if (accParam) return accParam.toLowerCase();
    const stored = localStorage.getItem('worship_account');
    return stored || initialAccount;
  });

  const [state, setState] = useState<WorshipState>(() => {
    try {
      const cached = localStorage.getItem(`worship_state_${account}`);
      if (cached) {
        return {
          ...DEFAULT_STATE,
          ...JSON.parse(cached),
          account,
        };
      }
    } catch (e) {}
    return {
      ...DEFAULT_STATE,
      account,
    };
  });

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [connectedCount, setConnectedCount] = useState<number>(1);
  const wsRef = useRef<WebSocket | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const isLocalUpdateRef = useRef(false);

  // Switch account
  const changeAccount = useCallback((newAccount: string) => {
    const clean = newAccount.trim().toLowerCase() || 'worship-main';
    setAccount(clean);
    localStorage.setItem('worship_account', clean);

    // Update URL param without full reload
    const url = new URL(window.location.href);
    url.searchParams.set('account', clean);
    window.history.replaceState({}, '', url.toString());

    // Reconnect socket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'join',
        account: clean,
        clientType,
      }));
    }
  }, [clientType]);

  // Setup BroadcastChannel for 0ms cross-tab synchronization
  useEffect(() => {
    const channelName = `worship_sync_channel_${account}`;
    let bc: BroadcastChannel | null = null;

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel(channelName);
        bcRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data && event.data.account === account && event.data.state) {
            setState((prev) => ({
              ...prev,
              ...event.data.state,
            }));
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not available:', e);
    }

    return () => {
      if (bc) {
        bc.close();
        bcRef.current = null;
      }
    };
  }, [account]);

  // Connect WebSocket
  useEffect(() => {
    let isCancelled = false;

    function connect() {
      if (isCancelled) return;
      setConnectionStatus('connecting');

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      try {
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          if (isCancelled) {
            socket.close();
            return;
          }
          setConnectionStatus('connected');
          socket.send(JSON.stringify({
            type: 'join',
            account,
            clientType,
          }));
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'init' || data.type === 'sync') {
              if (data.state) {
                isLocalUpdateRef.current = true;
                setState((prev) => ({
                  ...prev,
                  ...data.state,
                }));
                if (data.state.connectedDisplaysCount !== undefined) {
                  setConnectedCount(data.state.connectedDisplaysCount);
                }
              }
            } else if (data.type === 'count_update') {
              if (data.count !== undefined) {
                setConnectedCount(data.count);
              }
            }
          } catch (e) {
            console.error('Error parsing WS message:', e);
          }
        };

        socket.onclose = () => {
          if (!isCancelled) {
            setConnectionStatus('disconnected');
            // Try reconnect after 2 seconds
            reconnectTimeoutRef.current = setTimeout(connect, 2000);
          }
        };

        socket.onerror = (err) => {
          console.warn('WS socket error:', err);
          socket.close();
        };
      } catch (err) {
        console.error('Failed to instantiate WebSocket:', err);
        setConnectionStatus('disconnected');
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      }
    }

    connect();

    // Heartbeat ping interval
    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 20000);

    return () => {
      isCancelled = true;
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [account, clientType]);

  // Update state helper (broadcasts to server and updates local optimistically)
  const updateState = useCallback((updates: Partial<WorshipState>) => {
    setState((prev) => {
      const nextState = {
        ...prev,
        ...updates,
        account,
        lastUpdated: Date.now(),
      };

      try {
        localStorage.setItem(`worship_state_${account}`, JSON.stringify(nextState));
      } catch (e) {}

      // Broadcast to local tabs via BroadcastChannel (0ms latency)
      if (bcRef.current) {
        try {
          bcRef.current.postMessage({
            type: 'state_update',
            account,
            state: updates,
          });
        } catch (e) {}
      }

      // Broadcast to WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'update_state',
          account,
          state: updates,
        }));
      } else {
        // Fallback HTTP POST
        fetch(`/api/state/${encodeURIComponent(account)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }).catch((err) => console.warn('HTTP fallback sync error:', err));
      }

      return nextState;
    });
  }, [account]);

  return {
    account,
    changeAccount,
    state,
    updateState,
    connectionStatus,
    connectedCount,
  };
}
