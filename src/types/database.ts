export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          created_at?: string;
        };
      };
      mood_logs: {
        Row: {
          id: string;
          user_id: string;
          mood: string;
          mood_type: 'positive' | 'neutral' | 'negative' | 'bonus';
          journal_entry: string;
          timestamp: string;
          day: string;
          hour: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mood: string;
          mood_type: 'positive' | 'neutral' | 'negative' | 'bonus';
          journal_entry?: string;
          timestamp?: string;
          day: string;
          hour: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mood?: string;
          mood_type?: 'positive' | 'neutral' | 'negative' | 'bonus';
          journal_entry?: string;
          timestamp?: string;
          day?: string;
          hour?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      mood_type: 'positive' | 'neutral' | 'negative' | 'bonus';
    };
  };
}