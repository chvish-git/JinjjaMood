import { MoodLog } from '../types/mood';
import { collection, addDoc, query, orderBy, getDocs, where, limit, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { startOfDay, endOfDay } from 'date-fns';

const COLLECTION_NAME = 'moodLogs';

export const checkDailyMoodLimit = async (uid: string): Promise<boolean> => {
  if (!uid) {
    return false;
  }

  try {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const q = query(
      collection(db, COLLECTION_NAME),
      where('uid', '==', uid),
      where('timestamp', '>=', Timestamp.fromDate(startOfToday)),
      where('timestamp', '<=', Timestamp.fromDate(endOfToday))
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size > 0; // Returns true if user already logged mood today
  } catch (error: any) {
    console.error('Error checking daily mood limit:', error);
    // Fallback to localStorage check
    return checkDailyMoodLimitLocal(uid);
  }
};

export const saveMoodLog = async (moodLog: Omit<MoodLog, 'id'>, uid: string): Promise<MoodLog> => {
  if (!uid) {
    throw new Error('User ID is required to save mood logs');
  }

  // Check if user already logged mood today
  const hasLoggedToday = await checkDailyMoodLimit(uid);
  if (hasLoggedToday) {
    throw new Error('You\'ve already logged your mood today. Come back tomorrow! 🌅');
  }

  try {
    // Auto-fill timestamp from system clock
    const now = new Date();
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...moodLog,
      uid: uid,
      timestamp: serverTimestamp(), // Auto-filled from system
      readableDate: now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    });

    return {
      ...moodLog,
      id: docRef.id,
      timestamp: now // Use local time for immediate display
    };
  } catch (error: any) {
    console.error('Error saving mood log:', error);
    
    // Handle specific Firebase permission errors
    if (error.code === 'permission-denied') {
      throw new Error('Firebase permission error: Please configure your Firestore security rules to allow access to the moodLogs collection.');
    }
    
    // Fallback to localStorage for offline functionality
    return saveMoodLogLocal(moodLog, uid);
  }
};

export const getMoodLogs = async (uid: string): Promise<MoodLog[]> => {
  if (!uid) {
    // Return local storage data if no uid
    return getMoodLogsLocal(uid);
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('uid', '==', uid),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const logs: MoodLog[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        mood: data.mood,
        journalEntry: data.journalEntry,
        timestamp: data.timestamp.toDate()
      });
    });
    
    return logs;
  } catch (error: any) {
    console.error('Error fetching mood logs:', error);
    
    // Handle specific Firebase permission errors
    if (error.code === 'permission-denied') {
      throw new Error('Firebase permission error: Please configure your Firestore security rules to allow access to the moodLogs collection.');
    }
    
    // Fallback to localStorage
    return getMoodLogsLocal(uid);
  }
};

export const getLatestMoodLog = async (uid: string): Promise<MoodLog | null> => {
  if (!uid) {
    return getLatestMoodLogLocal(uid);
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('uid', '==', uid),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      mood: data.mood,
      journalEntry: data.journalEntry,
      timestamp: data.timestamp.toDate()
    };
  } catch (error: any) {
    console.error('Error fetching latest mood log:', error);
    
    // Handle specific Firebase permission errors
    if (error.code === 'permission-denied') {
      throw new Error('Firebase permission error: Please configure your Firestore security rules to allow access to the moodLogs collection.');
    }
    
    return getLatestMoodLogLocal(uid);
  }
};

// Fallback localStorage functions for offline functionality
const STORAGE_KEY = 'jinjjamood_logs';

const checkDailyMoodLimitLocal = (uid: string): boolean => {
  const logs = getMoodLogsLocal(uid);
  const today = new Date().toDateString();
  
  return logs.some(log => log.timestamp.toDateString() === today);
};

const saveMoodLogLocal = (moodLog: Omit<MoodLog, 'id'>, uid: string): MoodLog => {
  // Check daily limit for localStorage too
  const hasLoggedToday = checkDailyMoodLimitLocal(uid);
  if (hasLoggedToday) {
    throw new Error('You\'ve already logged your mood today. Come back tomorrow! 🌅');
  }

  const logs = getMoodLogsLocal(uid);
  const now = new Date(); // Auto-fill timestamp
  
  const newLog: MoodLog = {
    ...moodLog,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: now // Auto-filled from system clock
  };
  
  logs.push(newLog);
  localStorage.setItem(`${STORAGE_KEY}_${uid}`, JSON.stringify(logs));
  return newLog;
};

const getMoodLogsLocal = (uid: string): MoodLog[] => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${uid}`);
    if (!stored) return [];
    
    const logs = JSON.parse(stored);
    return logs.map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp)
    }));
  } catch (error) {
    console.error('Error loading mood logs from localStorage:', error);
    return [];
  }
};

const getLatestMoodLogLocal = (uid: string): MoodLog | null => {
  const logs = getMoodLogsLocal(uid);
  if (logs.length === 0) return null;
  
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
};