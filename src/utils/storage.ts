import { MoodLog } from '../types/mood';
import { supabase } from '../config/supabase';
import { format } from 'date-fns';
import { getMoodOption, getMoodValue } from '../data/moodOptions';

const DAILY_MOOD_LIMIT = 5;

export const checkDailyMoodLimit = async (userId: string): Promise<{ hasReachedLimit: boolean; count: number }> => {
  if (!userId) {
    return { hasReachedLimit: false, count: 0 };
  }

  try {
    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');

    // Query mood logs for today
    const { data, error } = await supabase
      .from('mood_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('day', todayString);
    
    if (error) {
      console.error('Error checking daily mood limit:', error);
      throw error;
    }
    
    const count = data?.length || 0;
    
    return { 
      hasReachedLimit: count >= DAILY_MOOD_LIMIT, 
      count 
    };
  } catch (error: any) {
    console.error('Error checking daily mood limit:', error);
    
    // Fallback to localStorage check
    const localResult = checkDailyMoodLimitLocal(userId);
    return { 
      hasReachedLimit: localResult, 
      count: localResult ? DAILY_MOOD_LIMIT : 0 
    };
  }
};

export const saveMoodLog = async (moodLog: Omit<MoodLog, 'id' | 'day' | 'hour' | 'moodType'>, userId: string): Promise<MoodLog> => {
  if (!userId) {
    throw new Error('User ID is required to save mood logs');
  }

  // Check if user has reached daily limit
  const { hasReachedLimit, count } = await checkDailyMoodLimit(userId);
  if (hasReachedLimit) {
    throw new Error(`You've logged ${DAILY_MOOD_LIMIT} moods today. Rest your vibe sensors! 🧠✨`);
  }

  try {
    // Auto-fill timestamp and derived fields
    const now = new Date();
    const moodOption = getMoodOption(moodLog.mood as any);
    
    const logData = {
      user_id: userId,
      mood: moodLog.mood,
      mood_type: moodOption?.type || 'neutral',
      journal_entry: moodLog.journalEntry || '',
      timestamp: now.toISOString(),
      day: format(now, 'yyyy-MM-dd'),
      hour: now.getHours(),
    };

    const { data, error } = await supabase
      .from('mood_logs')
      .insert(logData)
      .select()
      .single();

    if (error) {
      console.error('Error saving mood log:', error);
      throw error;
    }

    return {
      id: data.id,
      mood: data.mood,
      moodType: data.mood_type as any,
      journalEntry: data.journal_entry,
      timestamp: new Date(data.timestamp),
      day: data.day,
      hour: data.hour
    };
  } catch (error: any) {
    console.error('Error saving mood log:', error);
    
    // Fallback to localStorage
    return saveMoodLogLocal(moodLog, userId);
  }
};

export const getMoodLogs = async (userId: string): Promise<MoodLog[]> => {
  if (!userId) {
    return getMoodLogsLocal(userId);
  }

  try {
    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error fetching mood logs:', error);
      throw error;
    }
    
    const logs: MoodLog[] = (data || []).map(log => ({
      id: log.id,
      mood: log.mood,
      moodType: log.mood_type as any,
      journalEntry: log.journal_entry,
      timestamp: new Date(log.timestamp),
      day: log.day,
      hour: log.hour
    }));
    
    return logs;
  } catch (error: any) {
    console.error('Error fetching mood logs:', error);
    return getMoodLogsLocal(userId);
  }
};

export const getLatestMoodLog = async (userId: string): Promise<MoodLog | null> => {
  if (!userId) {
    return getLatestMoodLogLocal(userId);
  }

  try {
    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      console.error('Error fetching latest mood log:', error);
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    return {
      id: data.id,
      mood: data.mood,
      moodType: data.mood_type as any,
      journalEntry: data.journal_entry,
      timestamp: new Date(data.timestamp),
      day: data.day,
      hour: data.hour
    };
  } catch (error: any) {
    console.error('Error fetching latest mood log:', error);
    return getLatestMoodLogLocal(userId);
  }
};

export const getMoodLogsByDateRange = async (
  userId: string, 
  startDate: Date, 
  endDate: Date
): Promise<MoodLog[]> => {
  if (!userId) {
    return [];
  }

  try {
    const startDay = format(startDate, 'yyyy-MM-dd');
    const endDay = format(endDate, 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('day', startDay)
      .lte('day', endDay)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error fetching mood logs by date range:', error);
      throw error;
    }
    
    const logs: MoodLog[] = (data || []).map(log => ({
      id: log.id,
      mood: log.mood,
      moodType: log.mood_type as any,
      journalEntry: log.journal_entry,
      timestamp: new Date(log.timestamp),
      day: log.day,
      hour: log.hour
    }));
    
    return logs;
  } catch (error: any) {
    console.error('Error fetching mood logs by date range:', error);
    return [];
  }
};

// Fallback localStorage functions
const STORAGE_KEY = 'jinjjamood_logs';

const checkDailyMoodLimitLocal = (userId: string): boolean => {
  const logs = getMoodLogsLocal(userId);
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const todayLogs = logs.filter(log => log.day === today);
  return todayLogs.length >= DAILY_MOOD_LIMIT;
};

const saveMoodLogLocal = (moodLog: Omit<MoodLog, 'id' | 'day' | 'hour' | 'moodType'>, userId: string): MoodLog => {
  const hasReachedLimit = checkDailyMoodLimitLocal(userId);
  if (hasReachedLimit) {
    throw new Error(`You've logged ${DAILY_MOOD_LIMIT} moods today. Rest your vibe sensors! 🧠✨`);
  }

  const logs = getMoodLogsLocal(userId);
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
  localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(logs));
  return newLog;
};

const getMoodLogsLocal = (userId: string): MoodLog[] => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
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

const getLatestMoodLogLocal = (userId: string): MoodLog | null => {
  const logs = getMoodLogsLocal(userId);
  if (logs.length === 0) return null;
  
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
};