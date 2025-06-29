import { MoodLog, WeeklySummary, MonthlySummary } from '../types/mood';
import { getMoodValue, getMoodOption } from '../data/moodOptions';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  format, 
  differenceInDays,
  eachDayOfInterval,
  isWithinInterval,
  isSameDay
} from 'date-fns';

export const generateWeeklySummary = (logs: MoodLog[], targetDate: Date = new Date()): WeeklySummary => {
  const weekStart = startOfWeek(targetDate);
  const weekEnd = endOfWeek(targetDate);
  
  // Filter logs for this week
  const weekLogs = logs.filter(log => 
    isWithinInterval(log.timestamp, { start: weekStart, end: weekEnd })
  );

  if (weekLogs.length === 0) {
    return {
      mostCommonMood: 'neutral',
      moodStreak: 0,
      moodVariance: 0,
      totalLogs: 0,
      averageMoodScore: 3,
      bestDay: format(targetDate, 'EEEE'),
      hardestDay: format(targetDate, 'EEEE')
    };
  }

  // Most common mood
  const moodCounts = weekLogs.reduce((acc, log) => {
    acc[log.mood] = (acc[log.mood] || 0) + 1;
    return acc;
  }, {} as { [mood: string]: number });
  
  const mostCommonMood = Object.entries(moodCounts).reduce((a, b) => 
    moodCounts[a[0]] > moodCounts[b[0]] ? a : b
  )[0];

  // Mood streak (consecutive days with at least 1 mood log)
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  let moodStreak = 0;
  let currentStreak = 0;
  
  for (const day of daysInWeek) {
    const hasLogOnDay = weekLogs.some(log => isSameDay(log.timestamp, day));
    if (hasLogOnDay) {
      currentStreak++;
      moodStreak = Math.max(moodStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  // Mood variance (unique moods per day average)
  const dailyMoods = daysInWeek.map(day => {
    const dayLogs = weekLogs.filter(log => isSameDay(log.timestamp, day));
    return new Set(dayLogs.map(log => log.mood)).size;
  });
  const moodVariance = dailyMoods.reduce((sum, count) => sum + count, 0) / daysInWeek.length;

  // Average mood score
  const averageMoodScore = weekLogs.reduce((sum, log) => sum + getMoodValue(log.mood), 0) / weekLogs.length;

  // Best and hardest days
  const dailyAverages = daysInWeek.map(day => {
    const dayLogs = weekLogs.filter(log => isSameDay(log.timestamp, day));
    if (dayLogs.length === 0) return { day: format(day, 'EEEE'), average: 3 };
    
    const average = dayLogs.reduce((sum, log) => sum + getMoodValue(log.mood), 0) / dayLogs.length;
    return { day: format(day, 'EEEE'), average };
  });

  const bestDay = dailyAverages.reduce((a, b) => a.average > b.average ? a : b).day;
  const hardestDay = dailyAverages.reduce((a, b) => a.average < b.average ? a : b).day;

  return {
    mostCommonMood,
    moodStreak,
    moodVariance: Number(moodVariance.toFixed(1)),
    totalLogs: weekLogs.length,
    averageMoodScore: Number(averageMoodScore.toFixed(1)),
    bestDay,
    hardestDay
  };
};

export const generateMonthlySummary = (logs: MoodLog[], targetDate: Date = new Date()): MonthlySummary => {
  const monthStart = startOfMonth(targetDate);
  const monthEnd = endOfMonth(targetDate);
  
  // Filter logs for this month
  const monthLogs = logs.filter(log => 
    isWithinInterval(log.timestamp, { start: monthStart, end: monthEnd })
  );

  if (monthLogs.length === 0) {
    return {
      moodDistribution: {},
      bestDays: [],
      hardDays: [],
      consistencyScore: 0,
      totalLogs: 0,
      averageMoodScore: 3,
      moodTrends: []
    };
  }

  // Mood distribution
  const moodDistribution = monthLogs.reduce((acc, log) => {
    acc[log.mood] = (acc[log.mood] || 0) + 1;
    return acc;
  }, {} as { [mood: string]: number });

  // Daily averages for best/worst days
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const dailyData = daysInMonth.map(day => {
    const dayLogs = monthLogs.filter(log => isSameDay(log.timestamp, day));
    if (dayLogs.length === 0) return null;
    
    const average = dayLogs.reduce((sum, log) => sum + getMoodValue(log.mood), 0) / dayLogs.length;
    return {
      date: format(day, 'MMM dd'),
      average,
      logs: dayLogs.length
    };
  }).filter(Boolean) as Array<{ date: string; average: number; logs: number }>;

  // Best and hardest days (top 3 each)
  const sortedDays = [...dailyData].sort((a, b) => b.average - a.average);
  const bestDays = sortedDays.slice(0, 3).map(d => d.date);
  const hardDays = sortedDays.slice(-3).reverse().map(d => d.date);

  // Consistency score (percentage of days with at least 1 log)
  const daysWithLogs = dailyData.length;
  const consistencyScore = Math.round((daysWithLogs / daysInMonth.length) * 100);

  // Average mood score
  const averageMoodScore = monthLogs.reduce((sum, log) => sum + getMoodValue(log.mood), 0) / monthLogs.length;

  // Weekly trends within the month
  const weeksInMonth = Math.ceil(daysInMonth.length / 7);
  const moodTrends = Array.from({ length: weeksInMonth }, (_, weekIndex) => {
    const weekStart = new Date(monthStart);
    weekStart.setDate(weekStart.getDate() + (weekIndex * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekLogs = monthLogs.filter(log => 
      isWithinInterval(log.timestamp, { start: weekStart, end: weekEnd })
    );
    
    const averageScore = weekLogs.length > 0 
      ? weekLogs.reduce((sum, log) => sum + getMoodValue(log.mood), 0) / weekLogs.length
      : 3;
    
    return {
      week: weekIndex + 1,
      averageScore: Number(averageScore.toFixed(1))
    };
  });

  return {
    moodDistribution,
    bestDays,
    hardDays,
    consistencyScore,
    totalLogs: monthLogs.length,
    averageMoodScore: Number(averageMoodScore.toFixed(1)),
    moodTrends
  };
};

export const getMoodInsights = (logs: MoodLog[]): Array<{
  type: 'positive' | 'neutral' | 'concern';
  title: string;
  description: string;
  emoji: string;
}> => {
  if (logs.length === 0) return [];

  const insights = [];
  const recentLogs = logs.slice(0, 7); // Last 7 entries
  const averageRecent = recentLogs.reduce((sum, log) => sum + getMoodValue(log.mood), 0) / recentLogs.length;

  // Positive insights
  if (averageRecent >= 4) {
    insights.push({
      type: 'positive' as const,
      title: 'You\'re on fire! 🔥',
      description: `Your recent mood average is ${averageRecent.toFixed(1)}/5. Keep riding this wave!`,
      emoji: '🌟'
    });
  }

  // Consistency insight
  const uniqueDays = new Set(logs.slice(0, 14).map(log => format(log.timestamp, 'yyyy-MM-dd'))).size;
  if (uniqueDays >= 10) {
    insights.push({
      type: 'positive' as const,
      title: 'Consistency Champion!',
      description: `You've logged moods on ${uniqueDays} different days recently. Great habit!`,
      emoji: '🎯'
    });
  }

  // Variety insight
  const recentMoodTypes = new Set(recentLogs.map(log => getMoodOption(log.mood)?.type)).size;
  if (recentMoodTypes >= 3) {
    insights.push({
      type: 'neutral' as const,
      title: 'Full Spectrum Human',
      description: 'You\'re experiencing a healthy range of emotions. That\'s beautifully human.',
      emoji: '🌈'
    });
  }

  // Concern insight
  if (averageRecent <= 2) {
    insights.push({
      type: 'concern' as const,
      title: 'Tough stretch detected',
      description: 'Your recent moods have been challenging. Remember, this too shall pass.',
      emoji: '💙'
    });
  }

  return insights.slice(0, 3); // Return top 3 insights
};

export const calculateStreaks = (logs: MoodLog[]): {
  currentStreak: number;
  longestStreak: number;
  streakType: 'logging' | 'positive' | 'mixed';
} => {
  if (logs.length === 0) {
    return { currentStreak: 0, longestStreak: 0, streakType: 'logging' };
  }

  const sortedLogs = logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  // Calculate logging streak (consecutive days with logs)
  const today = new Date();
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Get unique days with logs
  const logDays = Array.from(new Set(sortedLogs.map(log => format(log.timestamp, 'yyyy-MM-dd'))))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  // Check current streak
  for (let i = 0; i < logDays.length; i++) {
    const logDate = new Date(logDays[i]);
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    
    if (format(logDate, 'yyyy-MM-dd') === format(expectedDate, 'yyyy-MM-dd')) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  // Calculate longest streak
  for (let i = 0; i < logDays.length - 1; i++) {
    const currentDate = new Date(logDays[i]);
    const nextDate = new Date(logDays[i + 1]);
    const dayDiff = differenceInDays(currentDate, nextDate);
    
    if (dayDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak + 1);
      tempStreak = 0;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak + 1);

  return {
    currentStreak,
    longestStreak,
    streakType: 'logging'
  };
};