export interface MoodLog {
  id: string;
  mood: string;
  journalEntry: string;
  timestamp: Date;
}

export type MoodType = 'Sad' | 'Neutral' | 'Good' | 'Stressed' | 'Hyped';