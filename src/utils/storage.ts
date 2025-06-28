import { MoodLog } from '../types/mood';
import { collection, addDoc, query, orderBy, getDocs, where, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { auth } from '../config/firebase';

const COLLECTION_NAME = 'moodLogs';

export const saveMoodLog = async (moodLog: Omit<MoodLog, 'id'>): Promise<MoodLog> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to save mood logs');
  }

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...moodLog,
      userId: user.uid,
      timestamp: moodLog.timestamp
    });

    return {
      ...moodLog,
      id: docRef.id
    };
  } catch (error) {
    console.error('Error saving mood log:', error);
    // Fallback to localStorage for offline functionality
    return saveMoodLogLocal(moodLog);
  }
};

export const getMoodLogs = async (): Promise<MoodLog[]> => {
  const user = auth.currentUser;
  if (!user) {
    // Return local storage data if not authenticated
    return getMoodLogsLocal();
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', user.uid),
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
  } catch (error) {
    console.error('Error fetching mood logs:', error);
    // Fallback to localStorage
    return getMoodLogsLocal();
  }
};

export const getLatestMoodLog = async (): Promise<MoodLog | null> => {
  const user = auth.currentUser;
  if (!user) {
    return getLatestMoodLogLocal();
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', user.uid),
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
  } catch (error) {
    console.error('Error fetching latest mood log:', error);
    return getLatestMoodLogLocal();
  }
};

// Fallback localStorage functions for offline functionality
const STORAGE_KEY = 'jinjjamood_logs';

const saveMoodLogLocal = (moodLog: Omit<MoodLog, 'id'>): MoodLog => {
  const logs = getMoodLogsLocal();
  const newLog: MoodLog = {
    ...moodLog,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
  };
  
  logs.push(newLog);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  return newLog;
};

const getMoodLogsLocal = (): MoodLog[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
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

const getLatestMoodLogLocal = (): MoodLog | null => {
  const logs = getMoodLogsLocal();
  if (logs.length === 0) return null;
  
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
};