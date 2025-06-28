import { VibeQuote, ThemeType } from '../types/vibeQuote';
import { MoodType } from '../types/mood';

export const vibeQuotes: VibeQuote[] = [
  { text: "Even your WiFi has bad days. It still connects eventually. So will you.", theme: "funny", mood: "neutral" },
  { text: "Crying is hydration, but from the inside out. Scientific-ish.", theme: "funny", mood: "sad" },
  { text: "Coffee can't solve everything, but it can try.", theme: "funny", mood: "stressed" },
  { text: "If Beyoncé survived 2008, you can survive today.", theme: "funny", mood: "hyped" },
  { text: "Your vibe is valid — even if it's currently sideways.", theme: "funny", mood: "neutral" },
  { text: "Today's mood is sponsored by absolutely no sleep.", theme: "funny", mood: "stressed" },
  { text: "Eat, cry, stretch, repeat. It's called balance.", theme: "funny", mood: "good" },
  { text: "You are not a burden. You are just someone being honest.", theme: "funny", mood: "sad" },
  { text: "Someone out there needs your exact weird energy. Don't shrink it.", theme: "funny", mood: "hyped" },
  { text: "You're allowed to feel like a mess and still be magic.", theme: "funny", mood: "sad" },
  
  { text: "The cherry blossoms fall... and bloom again. So will you.", theme: "soft", mood: "sad" },
  { text: "It's not 'just a bad day,' it's a character development arc.", theme: "soft", mood: "neutral" },
  { text: "In Japan they call it wabi-sabi: beauty in imperfection. You're doing just fine.", theme: "soft", mood: "stressed" },
  { text: "Healing isn't linear. Some days are plot twists. Keep reading.", theme: "soft", mood: "sad" },
  { text: "A soft reset isn't weakness. It's a system update.", theme: "soft", mood: "neutral" },
  { text: "Rest is a right, not a reward.", theme: "soft", mood: "stressed" },
  { text: "Nobody has it all figured out. Especially not before 11am.", theme: "soft", mood: "neutral" },
  { text: "You are the main character, even if today feels like background noise.", theme: "soft", mood: "sad" },
  { text: "Small joy is still real joy.", theme: "soft", mood: "good" },
  { text: "You are doing things your past self prayed for. Slow clap for that.", theme: "soft", mood: "good" },
  
  { text: "Mood: Somewhere between wanting to nap and take over the world.", theme: "chaotic", mood: "neutral" },
  { text: "Don't worry — even AI doesn't know what it's doing half the time.", theme: "chaotic", mood: "stressed" },
  { text: "You're a whole vibe. Not everyone will get the aesthetic. That's okay.", theme: "chaotic", mood: "hyped" },
  { text: "Let that mood cook. We're not rushing feelings here.", theme: "chaotic", mood: "neutral" },
  { text: "Some days your vibe is chaos. That's still energy.", theme: "chaotic", mood: "hyped" },
  { text: "Rihanna takes breaks. So can you.", theme: "chaotic", mood: "stressed" },
  { text: "If you're spiraling, at least do it in cute fonts.", theme: "chaotic", mood: "stressed" },
  { text: "You are the main character and the side quest. Embrace both.", theme: "chaotic", mood: "hyped" },
  { text: "This mood is brought to you by 5% effort and 95% vibes.", theme: "chaotic", mood: "good" },
  { text: "Be real — nobody has the folder named 'FinalFinal_2_ReallyFinal.psd' together.", theme: "chaotic", mood: "neutral" },
  
  { text: "You've survived 100% of your bad days so far. That's undefeated behavior.", theme: "deep", mood: "sad" },
  { text: "Ubuntu: I am because we are. The world's got your back.", theme: "deep", mood: "neutral" },
  { text: "Even Yoongi smiles sometimes. You will too.", theme: "deep", mood: "sad" },
  { text: "It's okay to not be okay. But it's also okay to eat noodles and pretend everything's fine.", theme: "deep", mood: "sad" },
  { text: "Your ancestors didn't make it through history so you could skip breakfast. Go eat.", theme: "deep", mood: "neutral" },
  { text: "You can be sad and still be a masterpiece in progress.", theme: "deep", mood: "sad" },
  { text: "Your mind is tired, not broken. Be gentle.", theme: "deep", mood: "stressed" },
  { text: "You're not lazy — you're healing, adapting, or just human.", theme: "deep", mood: "neutral" },
  { text: "You are not a burden. You are just someone being honest.", theme: "deep", mood: "sad" },
  { text: "Feelings aren't facts — but they deserve to be felt.", theme: "deep", mood: "neutral" },
  
  { text: "If all you did today was survive, that's worthy.", theme: "encouraging", mood: "sad" },
  { text: "Life's not always aesthetic. That doesn't make it less beautiful.", theme: "encouraging", mood: "neutral" },
  { text: "A lot can happen in 24 hours. Tomorrow might surprise you.", theme: "encouraging", mood: "stressed" },
  { text: "You don't need to earn rest. Rest is a right, not a reward.", theme: "encouraging", mood: "neutral" },
  { text: "Just because it's not loud doesn't mean it's not growth.", theme: "encouraging", mood: "neutral" },
  { text: "When you feel like quitting, remember that toddlers fall 50 times a day and keep going.", theme: "encouraging", mood: "sad" },
  { text: "You're not 'behind.' You're just on your own timeline.", theme: "encouraging", mood: "neutral" },
  { text: "You are the main character, even if today feels like background noise.", theme: "encouraging", mood: "sad" },
  { text: "Your brain is a squishy miracle trying its best. Respect it.", theme: "encouraging", mood: "stressed" },
  { text: "Sometimes healing looks like a nap. And that's valid.", theme: "encouraging", mood: "stressed" }
];

// Get daily theme based on day of week
export const getDailyTheme = (): ThemeType => {
  const themes: ThemeType[] = ['funny', 'soft', 'chaotic', 'deep', 'encouraging'];
  const dayIndex = new Date().getDay() % themes.length;
  return themes[dayIndex];
};

// Get random quote matching user's mood
export const getMoodMatchedQuote = (userMood: MoodType): VibeQuote => {
  const moodQuotes = vibeQuotes.filter(quote => quote.mood.toLowerCase() === userMood.toLowerCase());
  
  if (moodQuotes.length === 0) {
    // Fallback to any quote if no mood match
    return vibeQuotes[Math.floor(Math.random() * vibeQuotes.length)];
  }
  
  return moodQuotes[Math.floor(Math.random() * moodQuotes.length)];
};

// Get random quote matching both mood and daily theme
export const getPersonalizedQuote = (userMood: MoodType): VibeQuote => {
  const dailyTheme = getDailyTheme();
  
  // First try to match both mood and theme
  const perfectMatches = vibeQuotes.filter(
    quote => quote.mood.toLowerCase() === userMood.toLowerCase() && quote.theme === dailyTheme
  );
  
  if (perfectMatches.length > 0) {
    return perfectMatches[Math.floor(Math.random() * perfectMatches.length)];
  }
  
  // Fallback to mood-only match
  return getMoodMatchedQuote(userMood);
};

// Get random quote by theme
export const getThemeQuote = (theme: ThemeType): VibeQuote => {
  const themeQuotes = vibeQuotes.filter(quote => quote.theme === theme);
  
  if (themeQuotes.length === 0) {
    return vibeQuotes[Math.floor(Math.random() * vibeQuotes.length)];
  }
  
  return themeQuotes[Math.floor(Math.random() * themeQuotes.length)];
};

// Get completely random quote (original function)
export const getRandomVibeQuote = (): string => {
  const randomQuote = vibeQuotes[Math.floor(Math.random() * vibeQuotes.length)];
  return randomQuote.text;
};

// Get theme emoji for display
export const getThemeEmoji = (theme: ThemeType): string => {
  const themeEmojis = {
    funny: '😄',
    soft: '🌸',
    chaotic: '🌪️',
    deep: '🌊',
    encouraging: '✨'
  };
  return themeEmojis[theme];
};