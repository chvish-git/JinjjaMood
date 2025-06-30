import { MoodLog } from '../types/mood';
import { supabase } from '../config/supabase';
import { format } from 'date-fns';
import { getMoodOption } from '../data/moodOptions';

const DAILY_MOOD_LIMIT = 5;

export const checkDailyMoodLimit = async (userId: string): Promise<{ hasReachedLimit: boolean; count: number }> => {
  if (!userId) {
    return { hasReachedLimit: false, count: 0 };
  }

  try {
    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');

    console.log('🔍 DEBUG: Checking daily mood limit for user:', userId, 'date:', todayString);

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
    console.log('🔍 DEBUG: Found', count, 'mood logs for today');
    
    return { 
      hasReachedLimit: count >= DAILY_MOOD_LIMIT, 
      count 
    };
  } catch (error: any) {
    console.error('Error checking daily mood limit:', error);
    return { 
      hasReachedLimit: false, 
      count: 0 
    };
  }
};

export const saveMoodLog = async (moodLog: Omit<MoodLog, 'id' | 'day' | 'hour' | 'moodType'>, userId: string): Promise<MoodLog> => {
  if (!userId) {
    throw new Error('User ID is required to save mood logs');
  }

  console.log('🔵 DEBUG: Attempting to save mood log:', {
    mood: moodLog.mood,
    journalEntry: moodLog.journalEntry,
    userId: userId
  });

  // Check if user has reached daily limit
  const { hasReachedLimit, count } = await checkDailyMoodLimit(userId);
  if (hasReachedLimit) {
    throw new Error(`You've logged ${DAILY_MOOD_LIMIT} moods today! Rest your vibe sensors! 🧠✨`);
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

    console.log('🔵 DEBUG: Inserting mood log data:', logData);

    const { data, error } = await supabase
      .from('mood_logs')
      .insert(logData)
      .select()
      .single();

    if (error) {
      console.error('❌ DEBUG: Error saving mood log:', error);
      throw error;
    }

    console.log('✅ DEBUG: Mood log saved successfully:', data);

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
    console.error('❌ DEBUG: Error saving mood log:', error);
    
    // Check for specific error types
    if (error.message?.includes('violates row-level security policy')) {
      throw new Error('Authentication error. Please try logging in again.');
    }
    
    throw new Error(error.message || 'Failed to save mood log. Please try again.');
  }
};

export const getMoodLogs = async (userId: string): Promise<MoodLog[]> => {
  if (!userId) {
    return [];
  }

  try {
    console.log('🔍 DEBUG: Fetching mood logs for user:', userId);

    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('❌ DEBUG: Error fetching mood logs:', error);
      throw error;
    }
    
    console.log('✅ DEBUG: Fetched', data?.length || 0, 'mood logs');
    
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
    console.error('❌ DEBUG: Error fetching mood logs:', error);
    return [];
  }
};

export const getLatestMoodLog = async (userId: string): Promise<MoodLog | null> => {
  if (!userId) {
    return null;
  }

  try {
    console.log('🔍 DEBUG: Fetching latest mood log for user:', userId);

    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('❌ DEBUG: Error fetching latest mood log:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('🔍 DEBUG: No mood logs found');
      return null;
    }
    
    console.log('✅ DEBUG: Latest mood log fetched:', data[0].mood);
    
    return {
      id: data[0].id,
      mood: data[0].mood,
      moodType: data[0].mood_type as any,
      journalEntry: data[0].journal_entry,
      timestamp: new Date(data[0].timestamp),
      day: data[0].day,
      hour: data[0].hour
    };
  } catch (error: any) {
    console.error('❌ DEBUG: Error fetching latest mood log:', error);
    return null;
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

    console.log('🔍 DEBUG: Fetching mood logs for date range:', startDay, 'to', endDay);

    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('day', startDay)
      .lte('day', endDay)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('❌ DEBUG: Error fetching mood logs by date range:', error);
      throw error;
    }
    
    console.log('✅ DEBUG: Fetched', data?.length || 0, 'mood logs for date range');
    
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
    console.error('❌ DEBUG: Error fetching mood logs by date range:', error);
    return [];
  }
};