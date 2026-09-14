import { useState, useEffect } from 'react';
import {
  APP_VERSION,
  APP_DESIGNER,
  trackFirestoreUserVisit,
  updateFirestoreLivePresence,
  removeFirestoreLivePresence,
  subscribeToFirestoreStats,
} from './firebase';

export { APP_VERSION, APP_DESIGNER };

export interface AppStats {
  version: string;
  designer: string;
  totalLiveUsers: number;
  totalUsersUsed: number;
  isLiveConnected: boolean;
}

const STORAGE_VISITOR_ID = 'worship_visitor_id';
const STORAGE_VISITOR_COUNTED = 'worship_visitor_counted_v2';
const STORAGE_STATS_CACHE = 'worship_stats_cache_v2';

function getOrCreateVisitorId(): string {
  try {
    let id = localStorage.getItem(STORAGE_VISITOR_ID);
    if (!id) {
      id = `vis-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(STORAGE_VISITOR_ID, id);
    }
    return id;
  } catch (e) {
    return `vis-${Date.now()}`;
  }
}

function getCachedStats(): { totalUsersUsed: number; totalLiveUsers: number } {
  try {
    const raw = localStorage.getItem(STORAGE_STATS_CACHE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.totalUsersUsed === 'number') {
        return {
          totalUsersUsed: parsed.totalUsersUsed,
          totalLiveUsers: Math.max(1, parsed.totalLiveUsers || 1),
        };
      }
    }
  } catch (e) {}
  return {
    totalUsersUsed: 1248,
    totalLiveUsers: 1,
  };
}

function saveCachedStats(data: { totalUsersUsed: number; totalLiveUsers: number }) {
  try {
    localStorage.setItem(STORAGE_STATS_CACHE, JSON.stringify(data));
  } catch (e) {}
}

/**
 * Custom hook to consume real-time App Version, Designer attribution,
 * Total Live Users, and Cumulative Users Used Till Now.
 */
export function useAppStats(extraContext?: { deviceMode?: string; churchName?: string }): AppStats {
  const [stats, setStats] = useState<AppStats>(() => {
    const cached = getCachedStats();
    return {
      version: APP_VERSION,
      designer: APP_DESIGNER,
      totalLiveUsers: cached.totalLiveUsers,
      totalUsersUsed: cached.totalUsersUsed,
      isLiveConnected: false,
    };
  });

  useEffect(() => {
    const visitorId = getOrCreateVisitorId();
    let isCancelled = false;

    // 1. Check & increment new visitor record
    const hasBeenCounted = localStorage.getItem(STORAGE_VISITOR_COUNTED) === 'true';

    // A. Record in backend server
    fetch('/api/analytics/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId, isNew: !hasBeenCounted }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data && data.success) {
          localStorage.setItem(STORAGE_VISITOR_COUNTED, 'true');
          setStats((prev) => {
            const next = {
              ...prev,
              totalLiveUsers: Math.max(1, data.totalLiveUsers ?? prev.totalLiveUsers),
              totalUsersUsed: Math.max(prev.totalUsersUsed, data.totalUsersUsed ?? prev.totalUsersUsed),
              isLiveConnected: true,
            };
            saveCachedStats({
              totalLiveUsers: next.totalLiveUsers,
              totalUsersUsed: next.totalUsersUsed,
            });
            return next;
          });
        }
      })
      .catch(() => {
        // Fallback or offline
      });

    // B. Record in Firebase Firestore if new visitor
    if (!hasBeenCounted) {
      trackFirestoreUserVisit(visitorId).then((newCount) => {
        if (!isCancelled && newCount) {
          localStorage.setItem(STORAGE_VISITOR_COUNTED, 'true');
          setStats((prev) => {
            const next = {
              ...prev,
              totalUsersUsed: Math.max(prev.totalUsersUsed, newCount),
            };
            saveCachedStats({
              totalLiveUsers: next.totalLiveUsers,
              totalUsersUsed: next.totalUsersUsed,
            });
            return next;
          });
        }
      });
    }

    // 2. Real-time Firestore Stats & Presence subscription
    const unsubFirestore = subscribeToFirestoreStats((fbData) => {
      if (isCancelled) return;
      setStats((prev) => {
        const next = {
          ...prev,
          totalUsersUsed: fbData.totalUsersUsed
            ? Math.max(prev.totalUsersUsed, fbData.totalUsersUsed)
            : prev.totalUsersUsed,
          totalLiveUsers: fbData.totalLiveUsers
            ? Math.max(1, fbData.totalLiveUsers)
            : prev.totalLiveUsers,
          isLiveConnected: true,
        };
        saveCachedStats({
          totalLiveUsers: next.totalLiveUsers,
          totalUsersUsed: next.totalUsersUsed,
        });
        return next;
      });
    });

    // 3. Heartbeat for live presence (every 20 seconds)
    const sendHeartbeat = () => {
      // Firebase heartbeat
      updateFirestoreLivePresence(visitorId, extraContext);

      // Server heartbeat
      fetch('/api/analytics/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (!isCancelled && data?.success) {
            setStats((prev) => ({
              ...prev,
              totalLiveUsers: Math.max(1, data.totalLiveUsers ?? prev.totalLiveUsers),
              totalUsersUsed: Math.max(prev.totalUsersUsed, data.totalUsersUsed ?? prev.totalUsersUsed),
              isLiveConnected: true,
            }));
          }
        })
        .catch(() => {});
    };

    // Initial heartbeat
    sendHeartbeat();
    const heartbeatTimer = setInterval(sendHeartbeat, 20000);

    // 4. WebSocket Stats Listener (connects to /ws for instantaneous broadcast updates)
    let ws: WebSocket | null = null;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (!isCancelled) {
          setStats((prev) => ({ ...prev, isLiveConnected: true }));
        }
      };

      ws.onmessage = (event) => {
        if (isCancelled) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'stats_update') {
            setStats((prev) => {
              const next = {
                ...prev,
                totalLiveUsers: Math.max(1, data.totalLiveUsers ?? prev.totalLiveUsers),
                totalUsersUsed: Math.max(prev.totalUsersUsed, data.totalUsersUsed ?? prev.totalUsersUsed),
                isLiveConnected: true,
              };
              saveCachedStats({
                totalLiveUsers: next.totalLiveUsers,
                totalUsersUsed: next.totalUsersUsed,
              });
              return next;
            });
          }
        } catch (err) {}
      };
    } catch (e) {}

    // Cleanup on unmount or browser tab close
    return () => {
      isCancelled = true;
      clearInterval(heartbeatTimer);
      unsubFirestore();
      if (ws) {
        try {
          ws.close();
        } catch (e) {}
      }
      removeFirestoreLivePresence(visitorId);
    };
  }, [extraContext?.deviceMode, extraContext?.churchName]);

  return stats;
}
