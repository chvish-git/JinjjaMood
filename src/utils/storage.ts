import { MoodLog } from '../types/mood';

const STORAGE_KEY = 'jinjjamood_logs';

export const saveMoodLog = (moodLog: Omit<MoodLog, 'id'>): MoodLog => {
  const logs = getMoodLogs();
  const newLog: MoodLog = {
    ...moodLog,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
  };
  
  logs.push(newLog);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  return newLog;
};

export const getMoodLogs = (): MoodLog[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const logs = JSON.parse(stored);
    return logs.map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp)
    }));
  } catch (error) {
    console.error('Error loading mood logs:', error);
    return [];
  }
};

export const getLatestMoodLog = (): MoodLog | null => {
  const logs = getMoodLogs();
  if (logs.length === 0) return null;
  
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
};