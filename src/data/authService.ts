import { RegisteredUser, UserSession } from '../types';

const USERS_STORAGE_KEY = 'worship_registered_users';

export const INITIAL_REGISTERED_USERS: RegisteredUser[] = [
  {
    id: 'user-moshe',
    name: 'Moshe Ravi',
    email: 'moshe.ravikampadu@gmail.com',
    password: 'worship2026',
    churchName: 'Grace Community Church',
    role: 'Lead AV Director',
    createdAt: 1710000000000,
  },
  {
    id: 'user-faith-church',
    name: 'Worship Leader',
    email: 'leader@church.org',
    password: 'password123',
    churchName: 'Faith Fellowship Church',
    role: 'Worship Director',
    createdAt: 1710000000000,
  },
];

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
  } catch (e) {
    console.error('Failed to save registered users', e);
  }
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

export function loginUser(email: string, password: string): AuthResult {
  const cleanEmail = email.trim();
  if (!cleanEmail) {
    return {
      success: false,
      error: 'Please enter your email address.',
      errorType: 'invalid_input',
    };
  }
  if (!password) {
    return {
      success: false,
      error: 'Please enter your password.',
      errorType: 'invalid_input',
    };
  }

  const user = findUserByEmail(cleanEmail);
  if (!user) {
    return {
      success: false,
      error: `User not found! No registered account exists for "${cleanEmail}". Please check your email or click Register to create a new account.`,
      errorType: 'user_not_found',
    };
  }

  if (user.password !== password) {
    return {
      success: false,
      error: `Incorrect password! The password you entered for "${cleanEmail}" is not correct. Please try again.`,
      errorType: 'wrong_password',
    };
  }

  const username = user.name || cleanEmail.split('@')[0];
  const accountSlug = cleanEmail
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

export function registerUser(params: {
  name: string;
  email: string;
  password: string;
  churchName?: string;
}): AuthResult {
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanName = params.name.trim();
  const cleanChurch = (params.churchName || '').trim() || `${cleanName}'s Ministry`;
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

  const existing = findUserByEmail(cleanEmail);
  if (existing) {
    return {
      success: false,
      error: `An account with email "${cleanEmail}" already exists! Please click "Sign In" instead.`,
      errorType: 'user_already_exists',
    };
  }

  const newUser: RegisteredUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    email: cleanEmail,
    password,
    churchName: cleanChurch,
    role: 'Lead AV Director',
    createdAt: Date.now(),
  };

  const users = getRegisteredUsers();
  const updated = [newUser, ...users];
  saveRegisteredUsers(updated);

  const accountSlug = cleanEmail
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '') || 'worship-main';

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
