import { useState, useEffect } from 'react';
import {
  APP_VERSION,
  APP_DESIGNER,
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
          totalLiveUsers: Math.max(0, parsed.totalLiveUsers || 0),
        };
      }
    }
  } catch (e) {}
  return {
    totalUsersUsed: 0,
    totalLiveUsers: 0,
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
export function useAppStats(extraContext?: { deviceMode?: string; churchName?: string; accountId?: string }): AppStats {
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

    // Firebase is authoritative for both registered-user and account presence counts.
    const unsubFirestore = subscribeToFirestoreStats(extraContext?.accountId || '', (fbData) => {
      if (isCancelled) return;
      setStats((prev) => {
        const next = {
          ...prev,
          totalUsersUsed: typeof fbData.totalUsersUsed === 'number'
            ? fbData.totalUsersUsed
            : prev.totalUsersUsed,
          totalLiveUsers: typeof fbData.totalLiveUsers === 'number'
            ? fbData.totalLiveUsers
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

    // Heartbeat for account-scoped live presence (every 20 seconds)
    const sendHeartbeat = () => {
      updateFirestoreLivePresence(visitorId, extraContext);
    };

    // Initial heartbeat
    sendHeartbeat();
    const heartbeatTimer = setInterval(sendHeartbeat, 20000);

    // Cleanup on unmount or browser tab close
    return () => {
      isCancelled = true;
      clearInterval(heartbeatTimer);
      unsubFirestore();
      removeFirestoreLivePresence(visitorId);
    };
  }, [extraContext?.deviceMode, extraContext?.churchName, extraContext?.accountId]);

  return stats;
}
