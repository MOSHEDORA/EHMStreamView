import { RegisteredUser, UserSession } from '../types';
import {
  saveRegisteredUserToFirestore,
  fetchRegisteredUsersFromFirestore,
  subscribeToRegisteredUsers,
} from '../services/firebase';

const USERS_STORAGE_KEY = 'worship_registered_users';

export const INITIAL_REGISTERED_USERS: RegisteredUser[] = [
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

let usersBroadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    usersBroadcastChannel = new BroadcastChannel('worship_users_channel');
  }
} catch (e) {}

export function getRegisteredUsers(): RegisteredUser[] {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_REGISTERED_USERS));
      return INITIAL_REGISTERED_USERS;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse registered users, using initial defaults', e);
  }
  return INITIAL_REGISTERED_USERS;
}

export function saveRegisteredUsers(users: RegisteredUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    if (usersBroadcastChannel) {
      usersBroadcastChannel.postMessage({ type: 'users_updated', users });
    }
  } catch (e) {
    console.error('Failed to save registered users', e);
  }
}

// Real-time Firestore subscription handle
let firestoreUsersUnsub: (() => void) | null = null;

export function initRegisteredUsersRealtimeSync(onUpdate?: (users: RegisteredUser[]) => void): () => void {
  if (firestoreUsersUnsub) {
    return firestoreUsersUnsub;
  }
  firestoreUsersUnsub = subscribeToRegisteredUsers((incoming) => {
    const current = getRegisteredUsers();
    const map = new Map<string, RegisteredUser>();
    current.forEach((u) => map.set(u.email.toLowerCase().trim(), u));
    incoming.forEach((u) => map.set(u.email.toLowerCase().trim(), u));
    const merged = Array.from(map.values());
    saveRegisteredUsers(merged);
    if (onUpdate) {
      onUpdate(merged);
    }
  });
  return firestoreUsersUnsub;
}

// Fetch all registered users from both the real-time server database and Firebase Firestore
export async function fetchRegisteredUsers(): Promise<RegisteredUser[]> {
  const currentUsers = getRegisteredUsers();
  const userMap = new Map<string, RegisteredUser>();
  currentUsers.forEach((u) => userMap.set(u.email.toLowerCase().trim(), u));

  // 1. Fetch from Express server
  try {
    const res = await fetch('/api/auth/users');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        data.users.forEach((u: RegisteredUser) => {
          if (u.email) userMap.set(u.email.toLowerCase().trim(), u);
        });
      }
    }
  } catch (err) {
    console.warn('Could not fetch registered users from server, using local cache:', err);
  }

  // 2. Fetch from Firebase Firestore (/registered_users)
  try {
    const firestoreUsers = await fetchRegisteredUsersFromFirestore();
    if (Array.isArray(firestoreUsers) && firestoreUsers.length > 0) {
      firestoreUsers.forEach((u) => {
        if (u.email) userMap.set(u.email.toLowerCase().trim(), u);
      });
    }
  } catch (fsErr) {
    console.warn('Could not fetch registered users from Firestore:', fsErr);
  }

  const merged = Array.from(userMap.values());
  saveRegisteredUsers(merged);
  return merged;
}

export function findUserByEmail(email: string): RegisteredUser | undefined {
  const users = getRegisteredUsers();
  const cleanEmail = email.trim().toLowerCase();
  return users.find((u) => u.email.trim().toLowerCase() === cleanEmail);
}

export interface AuthResult {
  success: boolean;
  user?: RegisteredUser;
  session?: UserSession;
  error?: string;
  errorType?: 'user_not_found' | 'wrong_password' | 'invalid_input' | 'user_already_exists';
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanEmail) {
    return {
      success: false,
      error: 'Please enter your email address.',
      errorType: 'invalid_input',
    };
  }
  if (!cleanPassword) {
    return {
      success: false,
      error: 'Please enter your password.',
      errorType: 'invalid_input',
    };
  }

  // 1. Attempt Server-Side Login first (multi-device real-time authoritative)
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Sync local users list
      fetchRegisteredUsers().catch(() => {});
      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } else {
      return {
        success: false,
        error: data.error || 'Failed to sign in.',
        errorType: data.errorType || 'user_not_found',
      };
    }
  } catch (networkErr) {
    console.warn('Network issue contacting server, falling back to local verification:', networkErr);
  }

  // 2. Fallback to cached local users if offline
  const user = findUserByEmail(cleanEmail);
  if (!user) {
    return {
      success: false,
      error: `User not found! No registered account exists for "${cleanEmail}". Please check your email or click Register to create a new account.`,
      errorType: 'user_not_found',
    };
  }

  if (user.password !== cleanPassword) {
    return {
      success: false,
      error: `Incorrect password! The password you entered for "${cleanEmail}" is not correct. Please try again.`,
      errorType: 'wrong_password',
    };
  }

  const username = user.name || cleanEmail.split('@')[0];
  const accountSlug = user.accountSlug || cleanEmail
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '') || 'worship-main';

  const session: UserSession = {
    churchName: user.churchName || 'Community Church',
    accountName: accountSlug,
    operatorName: username,
    role: user.role || 'Lead AV Director',
    isLoggedIn: true,
    loginTime: Date.now(),
  };

  return {
    success: true,
    user,
    session,
  };
}

export async function registerUser(params: {
  name: string;
  email: string;
  password: string;
  churchName?: string;
  role?: string;
}): Promise<AuthResult> {
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanName = params.name.trim();
  const cleanChurch = (params.churchName || '').trim() || `${cleanName}'s Ministry`;
  const cleanRole = params.role || 'Lead AV Director';
  const password = params.password;

  if (!cleanName) {
    return {
      success: false,
      error: 'Please enter your full name or operator name.',
      errorType: 'invalid_input',
    };
  }

  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return {
      success: false,
      error: 'Please provide a valid email address (e.g. name@church.org).',
      errorType: 'invalid_input',
    };
  }

  if (!password || password.length < 4) {
    return {
      success: false,
      error: 'Password must be at least 4 characters long.',
      errorType: 'invalid_input',
    };
  }

  // 1. Attempt Server-Side Registration (broadcasts to all devices in real time)
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: cleanName,
        email: cleanEmail,
        password,
        churchName: cleanChurch,
        role: cleanRole,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      if (data.user) {
        saveRegisteredUserToFirestore(data.user).catch(() => {});
      }
      // Sync local users list
      fetchRegisteredUsers().catch(() => {});
      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } else {
      return {
        success: false,
        error: data.error || 'Failed to register account.',
        errorType: data.errorType || 'user_already_exists',
      };
    }
  } catch (networkErr) {
    console.warn('Network issue contacting server, falling back to local registration:', networkErr);
  }

  // 2. Fallback local registration if server unreachable
  const existing = findUserByEmail(cleanEmail);
  if (existing) {
    return {
      success: false,
      error: `An account with email "${cleanEmail}" already exists! Please click "Sign In" instead.`,
      errorType: 'user_already_exists',
    };
  }

  const accountSlug = cleanEmail
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '') || 'worship-main';

  const newUser: RegisteredUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    email: cleanEmail,
    password,
    churchName: cleanChurch,
    role: cleanRole,
    accountSlug,
    createdAt: Date.now(),
  };

  // Save to Firebase Firestore immediately
  saveRegisteredUserToFirestore(newUser).catch((err) => {
    console.warn('Firestore fallback user save:', err);
  });

  const users = getRegisteredUsers();
  const updated = [newUser, ...users];
  saveRegisteredUsers(updated);

  const session: UserSession = {
    churchName: newUser.churchName,
    accountName: accountSlug,
    operatorName: newUser.name,
    role: newUser.role,
    isLoggedIn: true,
    loginTime: Date.now(),
  };

  return {
    success: true,
    user: newUser,
    session,
  };
}
