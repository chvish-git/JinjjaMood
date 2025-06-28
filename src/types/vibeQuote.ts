export interface VibeQuote {
  text: string;
  theme: 'funny' | 'soft' | 'chaotic' | 'deep' | 'encouraging';
  mood: 'sad' | 'neutral' | 'good' | 'stressed' | 'hyped';
}

export type ThemeType = 'funny' | 'soft' | 'chaotic' | 'deep' | 'encouraging';