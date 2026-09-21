import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { SupermarketData, SupermarketMessage } from './types';

// Initialize Firebase App safely (singleton)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Database ID if configured
const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

// Initialize Firestore with experimentalForceLongPolling to prevent iframe proxy stream timeouts
function getInitializedFirestore() {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, dbId);
  } catch (e) {
    return dbId ? getFirestore(app, dbId) : getFirestore(app);
  }
}

export const db = getInitializedFirestore();

const SUPERMARKET_DOC_ID = 'main_supermarket_data';
const CHAT_COLLECTION = 'supermarket_live_chat';

/**
 * Deeply sanitizes an object for Firestore by removing any `undefined` values.
 * Firestore strictly rejects `undefined` values and throws:
 * "Unsupported field value: undefined"
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as any;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Date) {
    return data.toISOString() as any;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as any;
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) {
      sanitized[key] = sanitizeForFirestore(value);
    }
  }
  return sanitized as T;
}

// Real-time synchronization subscription for complete supermarket data
export function subscribeToSupermarketData(
  onData: (data: SupermarketData) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, 'supermarket_data', SUPERMARKET_DOC_ID);
  
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SupermarketData;
        onData(data);
      }
    },
    (error) => {
      console.warn('Firestore real-time sync error:', error);
      if (onError) onError(error);
    }
  );
}

// Save complete supermarket data to Firestore cloud (guaranteed 0 undefined errors)
export async function saveSupermarketDataToCloud(data: SupermarketData): Promise<void> {
  try {
    const docRef = doc(db, 'supermarket_data', SUPERMARKET_DOC_ID);
    const sanitizedData = sanitizeForFirestore({
      ...data,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, sanitizedData, { merge: true });
  } catch (error) {
    console.error('Error saving supermarket data to Firestore:', error);
  }
}

// Fetch initial data once from cloud
export async function fetchSupermarketDataFromCloud(): Promise<SupermarketData | null> {
  try {
    const docRef = doc(db, 'supermarket_data', SUPERMARKET_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as SupermarketData;
    }
    return null;
  } catch (err) {
    console.warn('Error fetching initial cloud supermarket data:', err);
    return null;
  }
}

// Factory Reset: Wipes all supermarket data from Firestore cloud
export async function clearAllSupermarketDataFromCloud(): Promise<void> {
  try {
    const docRef = doc(db, 'supermarket_data', SUPERMARKET_DOC_ID);
    await setDoc(docRef, {
      supermarketName: 'Xaaji Salaad Supermarket',
      products: [],
      categories: [],
      customers: [],
      debtPayments: [],
      suppliers: [],
      purchaseOrders: [],
      employees: [],
      attendance: [],
      sales: [],
      expenses: [],
      transactions: [],
      accounts: [],
      fixedAssets: [],
      liabilities: [],
      equityDetails: { initialCapital: 0, additionalInvestment: 0, drawings: 0 },
      users: [],
      messages: [],
      stockAdjustments: [],
      shiftClosures: [],
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error wiping Firestore cloud data:', error);
  }
}

// Real-time Live Chat Subscriptions (100% online sub-second updates)
export function subscribeToRealtimeChat(
  onMessages: (msgs: any[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, CHAT_COLLECTION);
    const q = query(colRef, orderBy('createdAt', 'asc'), limit(200));
    return onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));
        onMessages(msgs);
      },
      (error) => {
        console.warn('Chat subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Error setting up chat subscription:', err);
    return () => {};
  }
}

// Send live chat message to Firestore
export async function sendRealtimeChatMessage(msg: Record<string, any>): Promise<string | null> {
  try {
    const colRef = collection(db, CHAT_COLLECTION);
    const cleanMsg = sanitizeForFirestore({
      ...msg,
      createdAt: msg.createdAt || new Date().toISOString()
    });
    const docRef = await addDoc(colRef, cleanMsg);
    return docRef.id;
  } catch (error) {
    console.error('Error sending chat message:', error);
    return null;
  }
}

// Backward compatibility wrappers
export const subscribeToSchoolData = subscribeToSupermarketData;
export const saveSchoolDataToCloud = saveSupermarketDataToCloud;
export const fetchSchoolDataFromCloud = fetchSupermarketDataFromCloud;
