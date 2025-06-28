import { MoodLog } from '../types/mood';
import { format, startOfWeek, endOfWeek, isWithinInterval, differenceInDays } from 'date-fns';

export interface MoodInsight {
  type: 'pattern' | 'streak' | 'improvement' | 'concern' | 'milestone';
  title: string;
  description: string;
  emoji: string;
  priority: 'high' | 'medium' | 'low';
}

const getMoodValue = (mood: string): number => {
  const valueMap: { [key: string]: number } = {
    'Sad': 1,
    'Stressed': 2,
    'Neutral': 3,
    'Good': 4,
    'Hyped': 5
  };
  return valueMap[mood] || 3;
};

const getMoodEmoji = (mood: string) => {
  const emojiMap: { [key: string]: string } = {
    'Sad': '😢',
    'Neutral': '😐',
    'Good': '😊',
    'Stressed': '😰',
    'Hyped': '🤩'
  };
  return emojiMap[mood] || '😐';
};

export const generateMoodInsights = (logs: MoodLog[]): MoodInsight[] => {
  if (logs.length === 0) return [];

  const insights: MoodInsight[] = [];
  const sortedLogs = logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // 1. Check for current mood streak
  const currentStreak = getCurrentMoodStreak(sortedLogs);
  if (currentStreak.length >= 3) {
    const streakMood = currentStreak[0].mood;
    insights.push({
      type: 'streak',
      title: `${currentStreak.length}-Day ${streakMood} Streak`,
      description: `You've been feeling ${streakMood.toLowerCase()} for ${currentStreak.length} days in a row.`,
      emoji: getMoodEmoji(streakMood),
      priority: streakMood === 'Good' || streakMood === 'Hyped' ? 'high' : 'medium'
    });
  }

  // 2. Weekly mood pattern analysis
  const weeklyPattern = analyzeWeeklyPattern(logs);
  if (weeklyPattern) {
    insights.push(weeklyPattern);
  }

  // 3. Mood improvement detection
  const improvementTrend = detectImprovementTrend(sortedLogs);
  if (improvementTrend) {
    insights.push(improvementTrend);
  }

  // 4. Most common mood
  const mostCommonMood = getMostCommonMood(logs);
  if (mostCommonMood) {
    insights.push({
      type: 'pattern',
      title: `Your Go-To Vibe: ${mostCommonMood.mood}`,
      description: `${mostCommonMood.percentage}% of your check-ins have been ${mostCommonMood.mood.toLowerCase()}.`,
      emoji: getMoodEmoji(mostCommonMood.mood),
      priority: 'low'
    });
  }

  // 5. Milestone celebrations
  const milestone = checkMilestones(logs);
  if (milestone) {
    insights.push(milestone);
  }

  // 6. Consistency check
  const consistencyInsight = analyzeConsistency(logs);
  if (consistencyInsight) {
    insights.push(consistencyInsight);
  }

  return insights.slice(0, 4); // Return top 4 insights
};

const getCurrentMoodStreak = (sortedLogs: MoodLog[]): MoodLog[] => {
  if (sortedLogs.length === 0) return [];
  
  const streak = [sortedLogs[0]];
  const currentMood = sortedLogs[0].mood;
  
  for (let i = 1; i < sortedLogs.length; i++) {
    if (sortedLogs[i].mood === currentMood) {
      streak.push(sortedLogs[i]);
    } else {
      break;
    }
  }
  
  return streak;
};

const analyzeWeeklyPattern = (logs: MoodLog[]): MoodInsight | null => {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  
  const thisWeekLogs = logs.filter(log => 
    isWithinInterval(log.timestamp, { start: weekStart, end: weekEnd })
  );
  
  if (thisWeekLogs.length < 3) return null;
  
  const averageMood = thisWeekLogs.reduce((sum, log) => sum + getMoodValue(log.mood), 0) / thisWeekLogs.length;
  
  if (averageMood >= 4) {
    return {
      type: 'pattern',
      title: 'Great Week Vibes!',
      description: `This week has been particularly good for you with an average mood of ${averageMood.toFixed(1)}/5.`,
      emoji: '🌟',
      priority: 'high'
    };
  } else if (averageMood <= 2) {
    return {
      type: 'concern',
      title: 'Tough Week Check-in',
      description: `This week has been challenging. Remember, it's okay to have difficult periods.`,
      emoji: '🤗',
      priority: 'high'
    };
  }
  
  return null;
};

const detectImprovementTrend = (sortedLogs: MoodLog[]): MoodInsight | null => {
  if (sortedLogs.length < 5) return null;
  
  const recent = sortedLogs.slice(0, 3);
  const previous = sortedLogs.slice(3, 6);
  
  const recentAvg = recent.reduce((sum, log) => sum + getMoodValue(log.mood), 0) / recent.length;
  const previousAvg = previous.reduce((sum, log) => sum + getMoodValue(log.mood), 0) / previous.length;
  
  const improvement = recentAvg - previousAvg;
  
  if (improvement >= 1) {
    return {
      type: 'improvement',
      title: 'Mood on the Rise! 📈',
      description: `Your recent mood has improved significantly compared to earlier entries.`,
      emoji: '📈',
      priority: 'high'
    };
  } else if (improvement <= -1) {
    return {
      type: 'concern',
      title: 'Mood Dip Noticed',
      description: `Your mood has been lower recently. Consider what might help you feel better.`,
      emoji: '💙',
      priority: 'medium'
    };
  }
  
  return null;
};

const getMostCommonMood = (logs: MoodLog[]): { mood: string; percentage: number } | null => {
  if (logs.length === 0) return null;
  
  const moodCounts = logs.reduce((acc, log) => {
    acc[log.mood] = (acc[log.mood] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  const mostCommon = Object.entries(moodCounts).reduce((a, b) => 
    moodCounts[a[0]] > moodCounts[b[0]] ? a : b
  );
  
  return {
    mood: mostCommon[0],
    percentage: Math.round((mostCommon[1] / logs.length) * 100)
  };
};

const checkMilestones = (logs: MoodLog[]): MoodInsight | null => {
  const milestones = [
    { count: 7, title: 'Week Warrior!', emoji: '🗓️' },
    { count: 30, title: 'Month Master!', emoji: '📅' },
    { count: 50, title: 'Halfway Hero!', emoji: '🎯' },
    { count: 100, title: 'Century Celebrant!', emoji: '💯' }
  ];
  
  for (const milestone of milestones.reverse()) {
    if (logs.length >= milestone.count) {
      return {
        type: 'milestone',
        title: milestone.title,
        description: `You've logged ${logs.length} mood check-ins! Your commitment to self-awareness is inspiring.`,
        emoji: milestone.emoji,
        priority: 'high'
      };
    }
  }
  
  return null;
};

const analyzeConsistency = (logs: MoodLog[]): MoodInsight | null => {
  if (logs.length < 7) return null;
  
  const recent7Days = logs.slice(0, 7);
  const daysCovered = new Set(recent7Days.map(log => format(log.timestamp, 'yyyy-MM-dd'))).size;
  
  if (daysCovered >= 5) {
    return {
      type: 'pattern',
      title: 'Consistency Champion!',
      description: `You've checked in ${daysCovered} out of the last 7 days. Great habit building!`,
      emoji: '🎯',
      priority: 'medium'
    };
  }
  
  return null;
};

export const calculateMoodStats = (logs: MoodLog[]) => {
  if (logs.length === 0) {
    return {
      totalEntries: 0,
      averageMood: 0,
      mostCommonMood: null,
      longestStreak: 0,
      currentStreak: 0
    };
  }

  const sortedLogs = logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  // Calculate average mood
  const averageMood = logs.reduce((sum, log) => sum + getMoodValue(log.mood), 0) / logs.length;
  
  // Find most common mood
  const moodCounts = logs.reduce((acc, log) => {
    acc[log.mood] = (acc[log.mood] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  const mostCommonMood = Object.entries(moodCounts).reduce((a, b) => 
    moodCounts[a[0]] > moodCounts[b[0]] ? a : b
  )[0];
  
  // Calculate current streak
  const currentStreak = getCurrentMoodStreak(sortedLogs).length;
  
  // Calculate longest streak (simplified - same mood consecutive days)
  let longestStreak = 0;
  let currentStreakCount = 1;
  
  for (let i = 1; i < sortedLogs.length; i++) {
    if (sortedLogs[i].mood === sortedLogs[i-1].mood) {
      currentStreakCount++;
    } else {
      longestStreak = Math.max(longestStreak, currentStreakCount);
      currentStreakCount = 1;
    }
  }
  longestStreak = Math.max(longestStreak, currentStreakCount);
  
  return {
    totalEntries: logs.length,
    averageMood: Number(averageMood.toFixed(1)),
    mostCommonMood,
    longestStreak,
    currentStreak
  };
};