import { MoodLog } from '../types/mood';
import { collection, addDoc, query, orderBy, getDocs, where, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'moodLogs';

export const saveMoodLog = async (moodLog: Omit<MoodLog, 'id'>, username: string): Promise<MoodLog> => {
  if (!username) {
    throw new Error('Username is required to save mood logs');
  }

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...moodLog,
      username: username,
      timestamp: serverTimestamp()
    });

    return {
      ...moodLog,
      id: docRef.id
    };
  } catch (error: any) {
    console.error('Error saving mood log:', error);
    
    // Handle specific Firebase permission errors
    if (error.code === 'permission-denied') {
      throw new Error('Firebase permission error: Please configure your Firestore security rules to allow access to the moodLogs collection.');
    }
    
    // Fallback to localStorage for offline functionality
    return saveMoodLogLocal(moodLog, username);
  }
};

export const getMoodLogs = async (username: string): Promise<MoodLog[]> => {
  if (!username) {
    // Return local storage data if no username
    return getMoodLogsLocal(username);
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('username', '==', username),
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
    return getMoodLogsLocal(username);
  }
};

export const getLatestMoodLog = async (username: string): Promise<MoodLog | null> => {
  if (!username) {
    return getLatestMoodLogLocal(username);
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('username', '==', username),
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
    
    return getLatestMoodLogLocal(username);
  }
};

// Fallback localStorage functions for offline functionality
const STORAGE_KEY = 'jinjjamood_logs';

const saveMoodLogLocal = (moodLog: Omit<MoodLog, 'id'>, username: string): MoodLog => {
  const logs = getMoodLogsLocal(username);
  const newLog: MoodLog = {
    ...moodLog,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
  };
  
  logs.push(newLog);
  localStorage.setItem(`${STORAGE_KEY}_${username}`, JSON.stringify(logs));
  return newLog;
};

const getMoodLogsLocal = (username: string): MoodLog[] => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${username}`);
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

const getLatestMoodLogLocal = (username: string): MoodLog | null => {
  const logs = getMoodLogsLocal(username);
  if (logs.length === 0) return null;
  
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
};