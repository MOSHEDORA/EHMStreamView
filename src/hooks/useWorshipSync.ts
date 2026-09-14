import { useState, useEffect, useRef, useCallback } from 'react';
import { WorshipState } from '../types';
import { DEFAULT_STATE } from '../data/defaultSettings';
import { LiveSyncRelay, TransportMode, ConnectedDevice } from '../services/liveSyncRelay';
import { saveRegisteredUsers } from '../data/authService';

export function useWorshipSync(
  initialAccount: string = 'worship-main',
  clientType: 'operator' | 'display' | 'stage' = 'operator'
) {
  const [account, setAccount] = useState<string>(() => {
    // Check URL parameters first
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const accParam = params.get('account');
      if (accParam) return accParam.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'worship-main';
      const stored = localStorage.getItem('worship_account');
      if (stored) return stored.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'worship-main';
    }
    return initialAccount.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'worship-main';
  });

  const [state, setState] = useState<WorshipState>(() => {
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(`worship_state_${account}`);
        if (cached) {
          return {
            ...DEFAULT_STATE,
            ...JSON.parse(cached),
            account,
          };
        }
      }
    } catch (e) {}
    return {
      ...DEFAULT_STATE,
      account,
    };
  });

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [connectedCount, setConnectedCount] = useState<number>(1);
  const [transportMode, setTransportMode] = useState<TransportMode>('connecting');
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  const relayRef = useRef<LiveSyncRelay | null>(null);
  const lastAppliedStateRef = useRef(0);

  // Initialize or reconfigure LiveSyncRelay when account or clientType changes
  useEffect(() => {
    const relay = new LiveSyncRelay({
      account,
      clientType,
      onStateReceived: (incomingState) => {
        setState((prev) => {
          const incomingTimestamp = Number(incomingState?.lastUpdated || 0);
          if (incomingTimestamp && incomingTimestamp < lastAppliedStateRef.current) {
            return prev;
          }
          if (incomingTimestamp) {
            lastAppliedStateRef.current = incomingTimestamp;
          }
          const nextState = { ...prev, ...incomingState, account };
          try {
            localStorage.setItem(`worship_state_${account}`, JSON.stringify(nextState));
          } catch (e) {}
          return nextState;
        });
      },
      onCountUpdated: (count, devices) => {
        setConnectedCount(count);
        setConnectedDevices(devices);
      },
      onStatusChanged: (status, transport) => {
        setConnectionStatus(status);
        setTransportMode(transport);
      },
      onPongReceived: (latencyMs) => {
        setPingLatency(latencyMs);
      },
    });

    relayRef.current = relay;

    return () => {
      relay.destroy();
      relayRef.current = null;
    };
  }, [account, clientType]);

  // Handle mobile wake up, tab switching, and network re-connection
  useEffect(() => {
    const handleReactivation = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        // Attempt HTTP fetch if available
        fetch(`/api/state/${encodeURIComponent(account)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.state) {
              setState((prev) => {
                const incomingTimestamp = Number(data.state.lastUpdated || 0);
                if (incomingTimestamp && incomingTimestamp < lastAppliedStateRef.current) {
                  return prev;
                }
                if (incomingTimestamp) {
                  lastAppliedStateRef.current = incomingTimestamp;
                }
                const nextState = { ...prev, ...data.state, account };
                try {
                  localStorage.setItem(`worship_state_${account}`, JSON.stringify(nextState));
                } catch (e) {}
                return nextState;
              });
            }
          })
          .catch(() => {});

        // Request state from online peers via Cloud Relay
        if (relayRef.current && clientType !== 'operator') {
          relayRef.current.requestStateFromPeers();
        }
      }
    };

    document.addEventListener('visibilitychange', handleReactivation);
    window.addEventListener('focus', handleReactivation);
    window.addEventListener('online', handleReactivation);
    return () => {
      document.removeEventListener('visibilitychange', handleReactivation);
      window.removeEventListener('focus', handleReactivation);
      window.removeEventListener('online', handleReactivation);
    };
  }, [account, clientType]);

  // Keep displays current when a hosting provider suspends WebSocket or snapshot delivery.
  useEffect(() => {
    const intervalMs = Math.max(1000, Number(import.meta.env.VITE_SYNC_POLL_INTERVAL_MS || 2000));
    const pollState = () => {
      if (document.visibilityState !== 'visible' || !navigator.onLine) return;
      fetch(`/api/state/${encodeURIComponent(account)}`, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data?.state) return;
          const incomingTimestamp = Number(data.state.lastUpdated || 0);
          if (!incomingTimestamp || incomingTimestamp <= lastAppliedStateRef.current) return;
          lastAppliedStateRef.current = incomingTimestamp;
          setState((prev) => {
            const nextState = { ...prev, ...data.state, account };
            try {
              localStorage.setItem(`worship_state_${account}`, JSON.stringify(nextState));
            } catch (e) {}
            return nextState;
          });
        })
        .catch(() => {});
    };

    const timer = window.setInterval(pollState, intervalMs);
    return () => window.clearInterval(timer);
  }, [account]);

  // Switch church account
  const changeAccount = useCallback((newAccount: string) => {
    const clean = newAccount.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'worship-main';
    setAccount(clean);
    if (typeof window !== 'undefined') {
      localStorage.setItem('worship_account', clean);

      // Update URL param without full reload
      const url = new URL(window.location.href);
      url.searchParams.set('account', clean);
      window.history.replaceState({}, '', url.toString());
    }

    // Switch relay to new topic
    if (relayRef.current) {
      relayRef.current.switchAccount(clean);
    }

    // Try fetching account state from server
    fetch(`/api/state/${encodeURIComponent(clean)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.state) {
          setState((prev) => ({ ...prev, ...data.state, account: clean }));
        }
      })
      .catch(() => {});
  }, []);

  // Sync with initialAccount prop if it changes externally
  useEffect(() => {
    const cleanInitial = (initialAccount || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (cleanInitial && cleanInitial !== account) {
      changeAccount(cleanInitial);
    }
  }, [initialAccount, account, changeAccount]);

  // Update state helper (broadcasts across all transports: 0ms local, Cloud Relay, WS)
  const updateState = useCallback(
    (updates: Partial<WorshipState>) => {
      setState((prev) => {
        const nextState = {
          ...prev,
          ...updates,
          account,
          lastUpdated: Date.now(),
        };
        lastAppliedStateRef.current = nextState.lastUpdated;

        try {
          localStorage.setItem(`worship_state_${account}`, JSON.stringify(nextState));
        } catch (e) {}

        // Broadcast to LiveSyncRelay (handles local tabs, Cloud SSE PubSub, and Node WS)
        if (relayRef.current) {
          relayRef.current.broadcastState(updates);
        }

        // Fallback HTTP POST if available
        fetch(`/api/state/${encodeURIComponent(account)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }).catch(() => {});

        return nextState;
      });
    },
    [account]
  );

  const testPing = useCallback(() => {
    if (relayRef.current) {
      relayRef.current.sendPing();
    }
  }, []);

  return {
    account,
    changeAccount,
    state,
    updateState,
    connectionStatus,
    connectedCount,
    transportMode,
    connectedDevices,
    pingLatency,
    testPing,
  };
}
