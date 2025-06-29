import { MoodType } from '../types/mood';
import { getMoodOption } from '../data/moodOptions';

export interface MoodFeedback {
  type: 'positive' | 'neutral' | 'negative' | 'bonus';
  animation: string;
  message: string;
  emoji: string;
  color: string;
  duration: number;
}

export const getMoodFeedback = (mood: MoodType): MoodFeedback => {
  const moodOption = getMoodOption(mood);
  const type = moodOption?.type || 'neutral';

  const feedbackMap: Record<string, MoodFeedback> = {
    positive: {
      type: 'positive',
      animation: 'sparkles',
      message: '✨ You\'re radiating good vibes!',
      emoji: '🌟',
      color: 'from-green-400 to-emerald-500',
      duration: 3000
    },
    neutral: {
      type: 'neutral',
      animation: 'gentle-wave',
      message: '😌 Just vibing, and that\'s perfectly okay.',
      emoji: '🌊',
      color: 'from-blue-400 to-purple-500',
      duration: 2500
    },
    negative: {
      type: 'negative',
      animation: 'rain',
      message: '💙 We see you. This feeling will pass.',
      emoji: '🤗',
      color: 'from-blue-400 to-cyan-500',
      duration: 4000
    },
    bonus: {
      type: 'bonus',
      animation: 'sparkle-trail',
      message: '🔥 Main character energy unlocked!',
      emoji: '👑',
      color: 'from-pink-400 to-purple-500',
      duration: 3500
    }
  };

  return feedbackMap[type] || feedbackMap.neutral;
};

export const createMoodAnimation = (feedback: MoodFeedback): void => {
  // Remove any existing mood effects
  const existingEffects = document.querySelectorAll('.mood-effect');
  existingEffects.forEach(effect => effect.remove());

  const container = document.createElement('div');
  container.className = 'mood-effect';
  
  switch (feedback.animation) {
    case 'sparkles':
      createSparkleEffect(container);
      break;
    case 'rain':
      createRainEffect(container);
      break;
    case 'gentle-wave':
      createWaveEffect(container);
      break;
    case 'sparkle-trail':
      createSparkleTrailEffect(container);
      break;
  }

  document.body.appendChild(container);

  // Remove effect after duration
  setTimeout(() => {
    container.remove();
  }, feedback.duration);
};

const createSparkleEffect = (container: HTMLElement): void => {
  container.className += ' sparkle-container';
  
  for (let i = 0; i < 20; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.top = Math.random() * 100 + '%';
    sparkle.style.animationDelay = Math.random() * 2 + 's';
    sparkle.style.animationDuration = (1 + Math.random()) + 's';
    container.appendChild(sparkle);
  }
};

const createRainEffect = (container: HTMLElement): void => {
  container.className += ' rain-container';
  
  for (let i = 0; i < 15; i++) {
    const drop = document.createElement('div');
    drop.className = 'rain-drop';
    drop.style.left = Math.random() * 100 + '%';
    drop.style.animationDelay = Math.random() * 3 + 's';
    drop.style.animationDuration = (2 + Math.random()) + 's';
    container.appendChild(drop);
  }
};

const createWaveEffect = (container: HTMLElement): void => {
  container.className += ' mood-overlay mood-overlay-neutral';
  container.style.animation = 'gentleWave 4s ease-in-out';
};

const createSparkleTrailEffect = (container: HTMLElement): void => {
  container.className += ' sparkle-container';
  
  // Create floating text
  const text = document.createElement('div');
  text.textContent = '✨ ICONIC ✨';
  text.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 2rem;
    font-weight: bold;
    color: #ffd700;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    animation: scaleIn 0.5s ease-out, fadeInUp 2s ease-out 0.5s forwards;
    z-index: 1001;
  `;
  container.appendChild(text);
  
  // Create sparkles around the text
  for (let i = 0; i < 30; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = (45 + Math.random() * 10) + '%';
    sparkle.style.top = (45 + Math.random() * 10) + '%';
    sparkle.style.animationDelay = Math.random() * 1.5 + 's';
    sparkle.style.background = ['#ffd700', '#ff69b4', '#00ffff', '#ff4500'][Math.floor(Math.random() * 4)];
    container.appendChild(sparkle);
  }
};

export const createMoodOverlay = (type: string): void => {
  const overlay = document.createElement('div');
  overlay.className = `mood-overlay mood-overlay-${type}`;
  overlay.style.animation = 'fadeInUp 0.5s ease-out, fadeInUp 2s ease-out 2s reverse forwards';
  
  document.body.appendChild(overlay);
  
  setTimeout(() => {
    overlay.remove();
  }, 4000);
};