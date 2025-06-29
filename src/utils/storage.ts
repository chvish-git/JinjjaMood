import { MoodLog } from '../types/mood';
import { collection, addDoc, query, orderBy, getDocs, where, limit, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { startOfDay, endOfDay, format } from 'date-fns';
import { getMoodOption, getMoodValue } from '../data/moodOptions';

const COLLECTION_NAME = 'moodLogs';
const DAILY_MOOD_LIMIT = 5;

export const checkDailyMoodLimit = async (uid: string): Promise<{ hasReachedLimit: boolean; count: number }> => {
  if (!uid) {
    return { hasReachedLimit: false, count: 0 };
  }

  try {
    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');

    // Use the day field for efficient querying
    const q = query(
      collection(db, COLLECTION_NAME),
      where('uid', '==', uid),
      where('day', '==', todayString)
    );
    
    const querySnapshot = await getDocs(q);
    const count = querySnapshot.size;
    
    return { 
      hasReachedLimit: count >= DAILY_MOOD_LIMIT, 
      count 
    };
  } catch (error: any) {
    console.error('Error checking daily mood limit:', error);
    
    // Re-throw permission-denied errors to ensure they're handled properly
    if (error.code === 'permission-denied') {
      throw new Error('Firebase permission error: Please ensure you are properly authenticated.');
    }
    
    // Fallback to localStorage check for other errors
    const localResult = checkDailyMoodLimitLocal(uid);
    return { 
      hasReachedLimit: localResult, 
      count: localResult ? DAILY_MOOD_LIMIT : 0 
    };
  }
};

export const saveMoodLog = async (moodLog: Omit<MoodLog, 'id' | 'day' | 'hour' | 'moodType'>, uid: string): Promise<MoodLog> => {
  if (!uid) {
    throw new Error('User ID is required to save mood logs');
  }

  // Check if user has reached daily limit
  const { hasReachedLimit, count } = await checkDailyMoodLimit(uid);
  if (hasReachedLimit) {
    throw new Error(`You've logged ${DAILY_MOOD_LIMIT} moods today. Rest your vibe sensors! 🧠✨`);
  }

  try {
    // Auto-fill timestamp and derived fields
    const now = new Date();
    const moodOption = getMoodOption(moodLog.mood as any);
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...moodLog,
      uid: uid,
      timestamp: serverTimestamp(),
      day: format(now, 'yyyy-MM-dd'),
      hour: now.getHours(),
      moodType: moodOption?.type || 'neutral',
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
      timestamp: now,
      day: format(now, 'yyyy-MM-dd'),
      hour: now.getHours(),
      moodType: moodOption?.type || 'neutral'
    };
  } catch (error: any) {
    console.error('Error saving mood log:', error);
    
    // Re-throw permission-denied errors to ensure they're handled properly
    if (error.code === 'permission-denied') {
      throw new Error('Firebase permission error: Please ensure you are properly authenticated.');
    }
    
    // Fallback to localStorage
    return saveMoodLogLocal(moodLog, uid);
  }
};

export const getMoodLogs = async (uid: string): Promise<MoodLog[]> => {
  if (!uid) {
    return getMoodLogsLocal(uid);
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('uid', '==', uid)
    );
    
    const querySnapshot = await getDocs(q);
    const logs: MoodLog[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        mood: data.mood,
        moodType: data.moodType || 'neutral',
        journalEntry: data.journalEntry,
        timestamp: data.timestamp.toDate(),
        day: data.day || format(data.timestamp.toDate(), 'yyyy-MM-dd'),
        hour: data.hour || data.timestamp.toDate().getHours()
      });
    });
    
    // Sort client-side
    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return logs;
  } catch (error: any) {
    console.error('Error fetching mood logs:', error);
    
    // Re-throw permission-denied errors to ensure they're handled properly
    if (error.code === 'permission-denied') {
      throw new Error('Firebase permission error: Please ensure you are properly authenticated.');
    }
    
    return getMoodLogsLocal(uid);
  }
};

export const getLatestMoodLog = async (uid: string): Promise<MoodLog | null> => {
  if (!uid) {
    return getLatestMoodLogLocal(uid);
  }

  try {
    const logs = await getMoodLogs(uid);
    
    if (logs.length === 0) {
      return null;
    }
    
    return logs[0];
  } catch (error: any) {
    console.error('Error fetching latest mood log:', error);
    
    // Re-throw permission-denied errors to ensure they're handled properly
    if (error.code === 'permission-denied') {
      throw new Error('Firebase permission error: Please ensure you are properly authenticated.');
    }
    
    return getLatestMoodLogLocal(uid);
  }
};

export const getMoodLogsByDateRange = async (
  uid: string, 
  startDate: Date, 
  endDate: Date
): Promise<MoodLog[]> => {
  if (!uid) {
    return [];
  }

  try {
    const startDay = format(startDate, 'yyyy-MM-dd');
    const endDay = format(endDate, 'yyyy-MM-dd');

    const q = query(
      collection(db, COLLECTION_NAME),
      where('uid', '==', uid),
      where('day', '>=', startDay),
      where('day', '<=', endDay)
    );
    
    const querySnapshot = await getDocs(q);
    const logs: MoodLog[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        mood: data.mood,
        moodType: data.moodType || 'neutral',
        journalEntry: data.journalEntry,
        timestamp: data.timestamp.toDate(),
        day: data.day,
        hour: data.hour || data.timestamp.toDate().getHours()
      });
    });
    
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error: any) {
    console.error('Error fetching mood logs by date range:', error);
    
    // Re-throw permission-denied errors to ensure they're handled properly
    if (error.code === 'permission-denied') {
      throw new Error('Firebase permission error: Please ensure you are properly authenticated.');
    }
    
    return [];
  }
};

// Fallback localStorage functions
const STORAGE_KEY = 'jinjjamood_logs';

const checkDailyMoodLimitLocal = (uid: string): boolean => {
  const logs = getMoodLogsLocal(uid);
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const todayLogs = logs.filter(log => log.day === today);
  return todayLogs.length >= DAILY_MOOD_LIMIT;
};

const saveMoodLogLocal = (moodLog: Omit<MoodLog, 'id' | 'day' | 'hour' | 'moodType'>, uid: string): MoodLog => {
  const hasReachedLimit = checkDailyMoodLimitLocal(uid);
  if (hasReachedLimit) {
    throw new Error(`You've logged ${DAILY_MOOD_LIMIT} moods today. Rest your vibe sensors! 🧠✨`);
  }

  const logs = getMoodLogsLocal(uid);
  const now = new Date();
  const moodOption = getMoodOption(moodLog.mood as any);
  
  const newLog: MoodLog = {
    ...moodLog,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: now,
    day: format(now, 'yyyy-MM-dd'),
    hour: now.getHours(),
    moodType: moodOption?.type || 'neutral'
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
      timestamp: new Date(log.timestamp),
      moodType: log.moodType || 'neutral',
      day: log.day || format(new Date(log.timestamp), 'yyyy-MM-dd'),
      hour: log.hour || new Date(log.timestamp).getHours()
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