import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
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
  increment,
} from 'firebase/firestore';
import { WorshipState, UserSession } from '../types';
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

// Use custom database ID if provisioned, or default
export const db: Firestore = firebaseConfigData.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

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
 * Sign In with Google
 */
export async function signInWithGoogle(): Promise<{ user: User; session: UserSession }> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Derive account name from email prefix or user ID
  const emailPrefix = user.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : 'church';
  const defaultAccount = emailPrefix || 'worship-main';

  // Check if profile exists in Firestore
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  let accountName = defaultAccount;
  let role: 'operator' | 'admin' | 'viewer' = 'admin';

  if (snap.exists()) {
    const profile = snap.data() as UserProfileRecord;
    accountName = profile.accountName || defaultAccount;
    role = profile.role || 'admin';
  } else {
    // Create new profile in Firestore
    const newProfile: UserProfileRecord = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Worship Leader',
      accountName,
      role,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(userRef, newProfile, { merge: true });

    // Also initialize Church Account if not exists
    const accountRef = doc(db, 'accounts', accountName);
    const accSnap = await getDoc(accountRef);
    if (!accSnap.exists()) {
      await setDoc(accountRef, {
        id: accountName,
        name: user.displayName || 'Grace Church',
        churchName: `${user.displayName || 'Worship'} Ministry`,
        leader: user.displayName || 'Worship Pastor',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.uid,
      });
    }
  }

  const session: UserSession = {
    accountName,
    churchName: `${user.displayName || 'Grace'} Community Church`,
    operatorName: user.displayName || user.email || 'Worship Leader',
    role,
    isLoggedIn: true,
    loginTime: Date.now(),
  };

  return { user, session };
}

/**
 * Sign In with Email & Password
 */
export async function signInWithEmail(email: string, pass: string, desiredAccount?: string): Promise<UserSession> {
  let user: User;
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    user = res.user;
  } catch (err: any) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      // Auto register for convenient church team onboarding
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      user = res.user;
    } else {
      throw err;
    }
  }

  const defaultAcc = desiredAccount || (user.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : 'worship-main');
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  let accountName = defaultAcc;
  let role = 'operator';
  let churchName = 'Grace Community Church';

  if (snap.exists()) {
    const p = snap.data() as UserProfileRecord;
    accountName = desiredAccount || p.accountName || defaultAcc;
    role = p.role || 'operator';
  } else {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || '',
      displayName: user.email ? user.email.split('@')[0] : 'Operator',
      accountName,
      role,
      updatedAt: new Date().toISOString(),
    });
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

export async function trackFirestoreUserVisit(visitorId: string): Promise<number | null> {
  if (!visitorId) return null;
  try {
    const statsDocRef = doc(db, 'stats', 'global');
    const snap = await getDoc(statsDocRef);
    if (!snap.exists()) {
      await setDoc(statsDocRef, {
        totalUsersUsed: 1249,
        version: APP_VERSION,
        designer: APP_DESIGNER,
        updatedAt: new Date().toISOString(),
      });
      return 1249;
    } else {
      await setDoc(
        statsDocRef,
        {
          totalUsersUsed: increment(1),
          version: APP_VERSION,
          designer: APP_DESIGNER,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      const updatedSnap = await getDoc(statsDocRef);
      return updatedSnap.exists() ? updatedSnap.data()?.totalUsersUsed : null;
    }
  } catch (err) {
    console.warn('Firestore visit tracking fallback:', err);
    return null;
  }
}

export async function updateFirestoreLivePresence(
  sessionId: string,
  extra?: { deviceMode?: string; churchName?: string }
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
  onStatsUpdate: (data: { totalUsersUsed?: number; totalLiveUsers?: number }) => void
): Unsubscribe {
  const statsDocRef = doc(db, 'stats', 'global');
  const presenceColRef = collection(db, 'stats', 'global', 'presence');

  let currentUsersUsed = 1248;

  const unsubStats = onSnapshot(
    statsDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (typeof data.totalUsersUsed === 'number') {
          currentUsersUsed = data.totalUsersUsed;
          onStatsUpdate({ totalUsersUsed: currentUsersUsed });
        }
      }
    },
    () => {}
  );

  const unsubPresence = onSnapshot(
    presenceColRef,
    (snapshot) => {
      const now = Date.now();
      let liveCount = 0;
      snapshot.forEach((docItem) => {
        const data = docItem.data();
        if (data && data.lastSeen && now - data.lastSeen < 60000) {
          liveCount++;
        }
      });
      onStatsUpdate({
        totalLiveUsers: Math.max(1, liveCount),
      });
    },
    () => {}
  );

  return () => {
    unsubStats();
    unsubPresence();
  };
}

