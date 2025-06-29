import { MoodOption, MoodType } from '../types/mood';

export const moodOptions: MoodOption[] = [
  // Positive moods
  { 
    mood: 'joyful', 
    emoji: '😊', 
    type: 'positive', 
    color: 'from-yellow-400 to-orange-500', 
    darkColor: 'from-yellow-500 to-orange-600',
    description: 'Pure happiness and delight'
  },
  { 
    mood: 'productive', 
    emoji: '💪', 
    type: 'positive', 
    color: 'from-green-400 to-emerald-500', 
    darkColor: 'from-green-500 to-emerald-600',
    description: 'Getting things done with energy'
  },
  { 
    mood: 'calm', 
    emoji: '🧘', 
    type: 'positive', 
    color: 'from-blue-400 to-cyan-500', 
    darkColor: 'from-blue-500 to-cyan-600',
    description: 'Peaceful and centered'
  },
  { 
    mood: 'grateful', 
    emoji: '🙏', 
    type: 'positive', 
    color: 'from-purple-400 to-pink-500', 
    darkColor: 'from-purple-500 to-pink-600',
    description: 'Appreciating life\'s blessings'
  },
  { 
    mood: 'energized', 
    emoji: '⚡', 
    type: 'positive', 
    color: 'from-amber-400 to-yellow-500', 
    darkColor: 'from-amber-500 to-yellow-600',
    description: 'Full of life and vitality'
  },
  { 
    mood: 'confident', 
    emoji: '✨', 
    type: 'positive', 
    color: 'from-indigo-400 to-purple-500', 
    darkColor: 'from-indigo-500 to-purple-600',
    description: 'Self-assured and capable'
  },

  // Neutral moods
  { 
    mood: 'meh', 
    emoji: '😑', 
    type: 'neutral', 
    color: 'from-gray-400 to-slate-500', 
    darkColor: 'from-gray-500 to-slate-600',
    description: 'Just existing, no strong feelings'
  },
  { 
    mood: 'blank', 
    emoji: '😶', 
    type: 'neutral', 
    color: 'from-stone-400 to-gray-500', 
    darkColor: 'from-stone-500 to-gray-600',
    description: 'Empty mind, neutral state'
  },
  { 
    mood: 'tired', 
    emoji: '😴', 
    type: 'neutral', 
    color: 'from-slate-400 to-zinc-500', 
    darkColor: 'from-slate-500 to-zinc-600',
    description: 'Low energy but not negative'
  },
  { 
    mood: 'chill', 
    emoji: '😎', 
    type: 'neutral', 
    color: 'from-teal-400 to-cyan-500', 
    darkColor: 'from-teal-500 to-cyan-600',
    description: 'Relaxed and laid-back'
  },
  { 
    mood: 'focused', 
    emoji: '🎯', 
    type: 'neutral', 
    color: 'from-emerald-400 to-teal-500', 
    darkColor: 'from-emerald-500 to-teal-600',
    description: 'Concentrated and attentive'
  },
  { 
    mood: 'neutral', 
    emoji: '😐', 
    type: 'neutral', 
    color: 'from-gray-400 to-gray-600', 
    darkColor: 'from-gray-500 to-gray-700',
    description: 'Balanced, neither good nor bad'
  },

  // Negative moods
  { 
    mood: 'anxious', 
    emoji: '😰', 
    type: 'negative', 
    color: 'from-orange-400 to-red-500', 
    darkColor: 'from-orange-500 to-red-600',
    description: 'Worried and on edge'
  },
  { 
    mood: 'angry', 
    emoji: '😠', 
    type: 'negative', 
    color: 'from-red-400 to-rose-500', 
    darkColor: 'from-red-500 to-rose-600',
    description: 'Frustrated and irritated'
  },
  { 
    mood: 'stressed', 
    emoji: '😵', 
    type: 'negative', 
    color: 'from-yellow-400 to-orange-500', 
    darkColor: 'from-yellow-500 to-orange-600',
    description: 'Under pressure and overwhelmed'
  },
  { 
    mood: 'low energy', 
    emoji: '🔋', 
    type: 'negative', 
    color: 'from-slate-400 to-gray-500', 
    darkColor: 'from-slate-500 to-gray-600',
    description: 'Drained and depleted'
  },
  { 
    mood: 'overwhelmed', 
    emoji: '🌊', 
    type: 'negative', 
    color: 'from-blue-400 to-indigo-500', 
    darkColor: 'from-blue-500 to-indigo-600',
    description: 'Too much to handle'
  },
  { 
    mood: 'sad', 
    emoji: '😢', 
    type: 'negative', 
    color: 'from-blue-400 to-blue-600', 
    darkColor: 'from-blue-500 to-blue-700',
    description: 'Down and melancholy'
  },

  // Bonus (meme) moods
  { 
    mood: 'ungovernable', 
    emoji: '😈', 
    type: 'bonus', 
    color: 'from-purple-400 to-red-500', 
    darkColor: 'from-purple-500 to-red-600',
    description: 'Chaotic energy, can\'t be tamed'
  },
  { 
    mood: 'CEO mode', 
    emoji: '👑', 
    type: 'bonus', 
    color: 'from-yellow-400 to-amber-500', 
    darkColor: 'from-yellow-500 to-amber-600',
    description: 'Boss energy, making moves'
  },
  { 
    mood: 'fluff cloud', 
    emoji: '☁️', 
    type: 'bonus', 
    color: 'from-pink-300 to-purple-400', 
    darkColor: 'from-pink-400 to-purple-500',
    description: 'Soft, dreamy, floating vibes'
  },
  { 
    mood: 'main character', 
    emoji: '🌟', 
    type: 'bonus', 
    color: 'from-rose-400 to-pink-500', 
    darkColor: 'from-rose-500 to-pink-600',
    description: 'Living your best life'
  },
  { 
    mood: 'chaos gremlin', 
    emoji: '🔥', 
    type: 'bonus', 
    color: 'from-orange-400 to-red-500', 
    darkColor: 'from-orange-500 to-red-600',
    description: 'Mischievous and unpredictable'
  },
  { 
    mood: 'soft launch', 
    emoji: '🌸', 
    type: 'bonus', 
    color: 'from-pink-300 to-rose-400', 
    darkColor: 'from-pink-400 to-rose-500',
    description: 'Gentle introduction to feelings'
  }
];

export const getMoodOption = (mood: MoodType): MoodOption | undefined => {
  return moodOptions.find(option => option.mood === mood);
};

export const getMoodsByType = (type: 'positive' | 'neutral' | 'negative' | 'bonus'): MoodOption[] => {
  return moodOptions.filter(option => option.type === type);
};

export const getMoodValue = (mood: MoodType): number => {
  const option = getMoodOption(mood);
  if (!option) return 3;
  
  switch (option.type) {
    case 'positive': return 5;
    case 'bonus': return 4.5; // Bonus moods are generally positive but chaotic
    case 'neutral': return 3;
    case 'negative': return 1.5;
    default: return 3;
  }
};