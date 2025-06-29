export interface MoodLog {
  id: string;
  mood: string;
  moodType: 'positive' | 'neutral' | 'negative' | 'bonus';
  journalEntry: string;
  timestamp: Date;
  day: string; // yyyy-mm-dd format for easy querying
  hour: number; // 0-23 for time-based analysis
}

export type MoodType = 
  // Positive moods
  | 'joyful' | 'productive' | 'calm' | 'grateful' | 'energized' | 'confident'
  // Neutral moods  
  | 'meh' | 'blank' | 'tired' | 'chill' | 'focused' | 'neutral'
  // Negative moods
  | 'anxious' | 'angry' | 'stressed' | 'low energy' | 'overwhelmed' | 'sad'
  // Bonus (meme) moods
  | 'ungovernable' | 'CEO mode' | 'fluff cloud' | 'main character' | 'chaos gremlin' | 'soft launch';

export interface MoodOption {
  mood: MoodType;
  emoji: string;
  type: 'positive' | 'neutral' | 'negative' | 'bonus';
  color: string;
  darkColor: string;
  description: string;
}

export interface WeeklySummary {
  mostCommonMood: string;
  moodStreak: number;
  moodVariance: number;
  totalLogs: number;
  averageMoodScore: number;
  bestDay: string;
  hardestDay: string;
}

export interface MonthlySummary {
  moodDistribution: { [mood: string]: number };
  bestDays: string[];
  hardDays: string[];
  consistencyScore: number;
  totalLogs: number;
  averageMoodScore: number;
  moodTrends: { week: number; averageScore: number }[];
}