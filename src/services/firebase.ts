import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signOut,
  User,
  updateProfile,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  getDocFromServer,
  Firestore,
  Unsubscribe,
  collection,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { WorshipState, UserSession, Song } from '../types';
import firebaseConfigData from '../../firebase-applet-config.json';

// Initialize Firebase App
const firebaseConfig = {
  projectId: firebaseConfigData.projectId,
  appId: firebaseConfigData.appId,
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
};

export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth: Auth = getAuth(app);

const FIREBASE_OPERATION_TIMEOUT_MS = 15000;

async function withFirebaseTimeout<T>(operation: Promise<T>, operationName: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error(`${operationName} timed out. Check Firebase Auth, Firestore, and network settings.`);
      error.name = 'FirebaseTimeoutError';
      reject(error);
    }, FIREBASE_OPERATION_TIMEOUT_MS);
  });

  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export function getEmailAuthErrorMessage(error: any, action: 'sign in' | 'register'): string {
  const errorMessage = String(error?.message || '').toUpperCase();
  if (error?.code === 'auth/operation-not-allowed' || errorMessage.includes('PASSWORD_LOGIN_DISABLED')) {
    return `Email/password ${action} is disabled for this Firebase project. Enable Email/Password in Firebase Console > Authentication > Sign-in method.`;
  }
  if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password') {
    return 'The email or password is incorrect.';
  }
  if (error?.code === 'auth/email-already-in-use') {
    return 'This email is already registered. Please sign in instead.';
  }
  if (error?.code === 'auth/weak-password') {
    return 'Password must contain at least 6 characters.';
  }
  if (error?.code === 'permission-denied') {
    return 'Firebase Firestore rejected the account profile write. Deploy the Firestore rules for this project.';
  }
  if (error?.name === 'FirebaseTimeoutError') {
    return error.message;
  }
  return error?.message || `Failed to ${action}.`;
}

// Use custom database ID if provisioned, or default
const firestoreDatabaseId = (firebaseConfigData as typeof firebaseConfigData & {
  firestoreDatabaseId?: string;
}).firestoreDatabaseId;

export const db: Firestore = firestoreDatabaseId
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);

/**
 * Validate Connection to Firestore on startup as mandated by Firebase Integration Skill
 */
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is currently offline or connecting in cache mode:', error.message);
      return false;
    }
    // Expected 404 or permission denied on non-existent test document still proves connectivity
    return true;
  }
}

// Run connection validation
validateFirestoreConnection();

/**
 * Church Account Profile structure in Firestore (/accounts/{accountId})
 */
export interface ChurchAccountRecord {
  id: string;
  name: string;
  churchName: string;
  leader: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

/**
 * User Profile in Firestore (/users/{userId})
 */
export interface UserProfileRecord {
  uid: string;
  email: string;
  displayName: string;
  accountName: string;
  role: 'operator' | 'admin' | 'viewer';
  updatedAt: string;
}

/**
 * Sign In with Email & Password
 */
export async function signInWithEmail(email: string, pass: string, desiredAccount?: string): Promise<UserSession> {
  const res = await withFirebaseTimeout(
    signInWithEmailAndPassword(auth, email.trim().toLowerCase(), pass),
    'Email sign in'
  );
  const user = res.user;

  const defaultAcc = desiredAccount || (user.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : 'worship-main');
  const userRef = doc(db, 'users', user.uid);
  let accountName = defaultAcc;
  let role = 'operator';
  let churchName = `${user.displayName || user.email?.split('@')[0] || 'Worship'} Ministry`;

  // Auth is sufficient to sign in. Firestore profile data enriches the session
  // when available, but an unavailable database must not block the operator.
  try {
    const snap = await withFirebaseTimeout(getDoc(userRef), 'User profile loading');
    if (snap.exists()) {
      const p = snap.data() as UserProfileRecord;
      accountName = desiredAccount || p.accountName || defaultAcc;
      role = p.role || 'operator';
    } else {
      await withFirebaseTimeout(setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Operator',
        accountName,
        role,
        updatedAt: new Date().toISOString(),
      }), 'User profile creation');
    }
  } catch (profileError) {
    console.warn('Firestore profile unavailable; continuing with Firebase Auth session:', profileError);
  }

  return {
    accountName,
    churchName,
    operatorName: user.displayName || user.email || 'Worship Operator',
    role,
    isLoggedIn: true,
    loginTime: Date.now(),
  };
}

export async function sendEmailPasswordReset(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    const error = new Error('Enter your email address first.');
    error.name = 'InvalidResetEmailError';
    throw error;
  }
  await withFirebaseTimeout(
    sendPasswordResetEmail(auth, cleanEmail),
    'Password reset email'
  );
}

/**
 * Register an operator and create the account profile used by live sync.
 */
export async function registerWithEmail(
  name: string,
  email: string,
  pass: string,
  churchName: string,
  role: string = 'operator'
): Promise<UserSession> {
  const cleanEmail = email.trim().toLowerCase();
  const accountName = cleanEmail.split('@')[0].replace(/[^a-z0-9_-]/g, '') || 'worship-main';
  const result = await withFirebaseTimeout(
    createUserWithEmailAndPassword(auth, cleanEmail, pass),
    'Account creation'
  );
  const user = result.user;

  try {
    await withFirebaseTimeout(updateProfile(user, { displayName: name.trim() }), 'Profile update');
    await withFirebaseTimeout(setDoc(
      doc(db, 'users', user.uid),
      {
        uid: user.uid,
        email: cleanEmail,
        displayName: name.trim(),
        accountName,
        role,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    ), 'User profile creation');
    await withFirebaseTimeout(setDoc(
      doc(db, 'accounts', accountName),
      {
        id: accountName,
        name: name.trim(),
        churchName: churchName.trim(),
        leader: name.trim(),
        updatedAt: new Date().toISOString(),
        createdBy: user.uid,
      },
      { merge: true }
    ), 'Church account creation');
  } catch (profileError) {
    console.warn('Firebase Auth account created, but Firestore profile sync is unavailable:', profileError);
  }

  return {
    accountName,
    churchName: churchName.trim(),
    operatorName: name.trim(),
    role,
    isLoggedIn: true,
    loginTime: Date.now(),
  };
}

/**
 * Sign Out from Firebase
 */
export async function logOutFirebase(): Promise<void> {
  await signOut(auth);
}

/**
 * Sync Worship State to Firestore (/accounts/{accountId}/live/state)
 */
export async function saveWorshipStateToFirestore(accountId: string, state: WorshipState, updaterName?: string): Promise<void> {
  if (!accountId) return;
  try {
    const liveDocRef = doc(db, 'accounts', accountId, 'live', 'state');
    const payload = {
      accountId,
      currentSlide: state.currentSlide || null,
      nextSlide: state.nextSlide || null,
      lastUpdated: state.lastUpdated || Date.now(),
      displayMode: state.displayMode || 'fullscreen',
      isBlackout: Boolean(state.isBlackout),
      isClearText: Boolean(state.isClearText),
      isLogo: Boolean(state.isLogo),
      alertText: state.alertText || '',
      isAlertVisible: Boolean(state.isAlertVisible),
      theme: state.theme,
      updatedAt: new Date().toISOString(),
      updatedBy: updaterName || auth.currentUser?.displayName || 'Operator',
    };

    await setDoc(liveDocRef, payload, { merge: true });
  } catch (error) {
    console.warn('Firestore live state write failed (will use fallback relay):', error);
  }
}

/**
 * Subscribe to Real-Time Worship State from Firestore
 */
export function subscribeToFirestoreWorshipState(
  accountId: string,
  onStateUpdate: (state: Partial<WorshipState>) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!accountId) {
    return () => {};
  }

  const liveDocRef = doc(db, 'accounts', accountId, 'live', 'state');

  return onSnapshot(
    liveDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        onStateUpdate({
          currentSlide: data.currentSlide || null,
          nextSlide: data.nextSlide || null,
          lastUpdated: Number(data.lastUpdated || Date.parse(data.updatedAt || '') || 0),
          displayMode: data.displayMode || 'fullscreen',
          isBlackout: Boolean(data.isBlackout),
          isClearText: Boolean(data.isClearText),
          isLogo: Boolean(data.isLogo),
          alertText: data.alertText || '',
          isAlertVisible: Boolean(data.isAlertVisible),
          theme: data.theme,
        });
      }
    },
    (error) => {
      console.warn('Firestore live state subscription warning:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Fetch Initial Worship State from Firestore
 */
export async function fetchInitialFirestoreWorshipState(accountId: string): Promise<Partial<WorshipState> | null> {
  if (!accountId) return null;
  try {
    const liveDocRef = doc(db, 'accounts', accountId, 'live', 'state');
    const snap = await getDoc(liveDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        currentSlide: data.currentSlide || null,
        nextSlide: data.nextSlide || null,
        lastUpdated: Number(data.lastUpdated || Date.parse(data.updatedAt || '') || 0),
        displayMode: data.displayMode || 'fullscreen',
        isBlackout: Boolean(data.isBlackout),
        isClearText: Boolean(data.isClearText),
        isLogo: Boolean(data.isLogo),
        alertText: data.alertText || '',
        isAlertVisible: Boolean(data.isAlertVisible),
        theme: data.theme,
      };
    }
  } catch (error) {
    console.warn('Failed to fetch initial state from Firestore:', error);
  }
  return null;
}

/**
 * Global App Usage Analytics & Live Presence Tracking in Firestore
 */
export const APP_VERSION = 'v2.6.4';
export const APP_DESIGNER = 'Designed by Moshe Dora from EHM, Kakinada';

export async function updateFirestoreLivePresence(
  sessionId: string,
  extra?: { deviceMode?: string; churchName?: string; accountId?: string }
): Promise<void> {
  if (!sessionId) return;
  try {
    const presenceRef = doc(db, 'stats', 'global', 'presence', sessionId);
    await setDoc(
      presenceRef,
      {
        sessionId,
        lastSeen: Date.now(),
        deviceMode: extra?.deviceMode || 'desktop',
        churchName: extra?.churchName || 'General Sanctuary',
        accountId: extra?.accountId || '',
      },
      { merge: true }
    );
  } catch (err) {
    // Non-fatal presence ping warning
  }
}

export async function removeFirestoreLivePresence(sessionId: string): Promise<void> {
  if (!sessionId) return;
  try {
    const presenceRef = doc(db, 'stats', 'global', 'presence', sessionId);
    await deleteDoc(presenceRef);
  } catch (err) {}
}

export function subscribeToFirestoreStats(
  accountId: string,
  onStatsUpdate: (data: { totalUsersUsed?: number; totalLiveUsers?: number }) => void
): Unsubscribe {
  // Firebase app user profiles are stored under /users by both email and Google sign-in.
  const usersColRef = collection(db, 'users');
  const presenceColRef = collection(db, 'stats', 'global', 'presence');

  const unsubUsers = onSnapshot(usersColRef, (snapshot) => {
    onStatsUpdate({ totalUsersUsed: snapshot.size });
  }, () => {});

  const unsubPresence = onSnapshot(
    presenceColRef,
    (snapshot) => {
      const now = Date.now();
      let liveCount = 0;
      snapshot.forEach((docItem) => {
        const data = docItem.data();
        if (
          data &&
          data.accountId === accountId &&
          data.lastSeen &&
          now - data.lastSeen < 60000
        ) {
          liveCount++;
        }
      });
      onStatsUpdate({
        totalLiveUsers: liveCount,
      });
    },
    () => {}
  );

  return () => {
    unsubUsers();
    unsubPresence();
  };
}

/**
 * ============================================================================
 * Synchronized Church Songs per Account in Firebase Firestore
 * Path: /accounts/{accountId}/songs/{songId}
 * ============================================================================
 */
export async function saveSongToFirestore(accountId: string, song: Song): Promise<boolean> {
  const cleanAccount = (accountId || 'worship-main').toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'worship-main';
  if (!song || !song.id) return false;
  try {
    const songDocRef = doc(db, 'accounts', cleanAccount, 'songs', song.id);
    await setDoc(
      songDocRef,
      {
        id: song.id,
        title: song.title,
        artist: song.artist || '',
        key: song.key || 'G',
        ccli: song.ccli || '',
        tempo: song.tempo || '',
        tags: song.tags || [],
        sections: song.sections || [],
        accountId: cleanAccount,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn('Failed to save song to Firestore:', err);
    return false;
  }
}

export async function deleteSongFromFirestore(accountId: string, songId: string): Promise<boolean> {
  const cleanAccount = (accountId || 'worship-main').toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'worship-main';
  if (!songId) return false;
  try {
    const songDocRef = doc(db, 'accounts', cleanAccount, 'songs', songId);
    await deleteDoc(songDocRef);
    return true;
  } catch (err) {
    console.warn('Failed to delete song from Firestore:', err);
    return false;
  }
}

export async function loadAccountSongsFromFirestore(accountId: string): Promise<Song[]> {
  const cleanAccount = (accountId || 'worship-main').toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'worship-main';
  try {
    const songsColRef = collection(db, 'accounts', cleanAccount, 'songs');
    const snap = await getDocs(songsColRef);
    const result: Song[] = [];
    snap.forEach((docItem) => {
      const data = docItem.data();
      if (data && data.title && Array.isArray(data.sections)) {
        result.push({
          id: data.id || docItem.id,
          title: data.title,
          artist: data.artist || '',
          key: data.key || 'G',
          ccli: data.ccli || '',
          tempo: data.tempo || '',
          tags: data.tags || [],
          sections: data.sections || [],
        });
      }
    });
    return result;
  } catch (err) {
    console.warn('Failed to load songs from Firestore:', err);
    return [];
  }
}

export function subscribeToAccountSongs(
  accountId: string,
  onSongsUpdate: (songs: Song[]) => void
): Unsubscribe {
  const cleanAccount = (accountId || 'worship-main').toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'worship-main';
  const songsColRef = collection(db, 'accounts', cleanAccount, 'songs');

  return onSnapshot(
    songsColRef,
    (snapshot) => {
      const songs: Song[] = [];
      snapshot.forEach((docItem) => {
        const data = docItem.data();
        if (data && data.title && Array.isArray(data.sections)) {
          songs.push({
            id: data.id || docItem.id,
            title: data.title,
            artist: data.artist || '',
            key: data.key || 'G',
            ccli: data.ccli || '',
            tempo: data.tempo || '',
            tags: data.tags || [],
            sections: data.sections || [],
          });
        }
      });
      onSongsUpdate(songs);
    },
    (err) => {
      console.warn('Songs Firestore subscription error:', err);
    }
  );
}



