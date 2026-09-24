import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  deleteDoc, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId as required by Firebase skill
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Error Handling conforming to Firebase Skill specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection validation test as mandated by Firebase skill
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is disconnected.');
    }
    // Expected to return false or error since /test/connection rule is denied by default-deny
    return false;
  }
}

// Authentication Helpers
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Sync user profile to Firestore
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      try {
        const userDoc = await getDoc(userRef);
        const now = new Date().toISOString();
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            id: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'User',
            photoURL: user.photoURL || '',
            createdAt: now,
            lastLoginAt: now
          });
        } else {
          await setDoc(userRef, {
            displayName: user.displayName || userDoc.data()?.displayName || 'User',
            photoURL: user.photoURL || userDoc.data()?.photoURL || '',
            lastLoginAt: now
          }, { merge: true });
        }
      } catch (e) {
        console.warn('Profile sync error:', e);
      }
    }
    return user;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function logOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export interface ToolHistoryRecord {
  id: string;
  userId: string;
  toolId: string;
  toolName: string;
  fileName: string;
  fileSize?: number;
  resultSize?: number;
  pageCount?: number;
  status: 'success' | 'failed';
  createdAt: string;
}

// Tool History logging
export async function recordToolUsage(record: Omit<ToolHistoryRecord, 'id' | 'userId' | 'createdAt'>): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const historyId = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${currentUser.uid}/history/${historyId}`;

  try {
    await setDoc(doc(db, 'users', currentUser.uid, 'history', historyId), {
      id: historyId,
      userId: currentUser.uid,
      toolId: record.toolId,
      toolName: record.toolName,
      fileName: record.fileName.slice(0, 250),
      fileSize: record.fileSize || 0,
      resultSize: record.resultSize || 0,
      pageCount: record.pageCount || 1,
      status: record.status,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// Fetch user history
export async function fetchUserHistory(): Promise<ToolHistoryRecord[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  const path = `users/${currentUser.uid}/history`;
  try {
    const q = query(collection(db, 'users', currentUser.uid, 'history'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as ToolHistoryRecord);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

// Delete history item
export async function removeHistoryItem(historyId: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const path = `users/${currentUser.uid}/history/${historyId}`;
  try {
    await deleteDoc(doc(db, 'users', currentUser.uid, 'history', historyId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// User Favorites
export async function toggleFavoriteTool(toolId: string, isFav: boolean): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const path = `users/${currentUser.uid}/favorites/${toolId}`;
  try {
    const favRef = doc(db, 'users', currentUser.uid, 'favorites', toolId);
    if (isFav) {
      await setDoc(favRef, {
        toolId,
        userId: currentUser.uid,
        addedAt: new Date().toISOString()
      });
    } else {
      await deleteDoc(favRef);
    }
  } catch (err) {
    handleFirestoreError(err, isFav ? OperationType.CREATE : OperationType.DELETE, path);
  }
}

export async function fetchUserFavorites(): Promise<string[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  const path = `users/${currentUser.uid}/favorites`;
  try {
    const snapshot = await getDocs(collection(db, 'users', currentUser.uid, 'favorites'));
    return snapshot.docs.map(d => d.id);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}
