import React from 'react';
import { Lightbulb, TrendingUp, Heart, AlertCircle } from 'lucide-react';

interface MoodInsight {
  type: 'positive' | 'neutral' | 'concern';
  title: string;
  description: string;
  emoji: string;
}

interface MoodInsightsCardProps {
  insights: MoodInsight[];
  isDark: boolean;
}

export const MoodInsightsCard: React.FC<MoodInsightsCardProps> = ({ insights, isDark }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <TrendingUp className="w-5 h-5" />;
      case 'concern': return <AlertCircle className="w-5 h-5" />;
      default: return <Heart className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return isDark ? 'border-green-500 bg-green-500/10 text-green-300' : 'border-green-400 bg-green-50 text-green-800';
      case 'concern': return isDark ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-blue-400 bg-blue-50 text-blue-800';
      default: return isDark ? 'border-purple-500 bg-purple-500/10 text-purple-300' : 'border-purple-400 bg-purple-50 text-purple-800';
    }
  };

  if (insights.length === 0) {
    return (
      <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
        isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className={`${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} size={24} />
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Mood Insights
          </h3>
        </div>
        <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Keep logging your moods to unlock personalized insights! 🌟
        </p>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
      isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
    }`}>
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className={`${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} size={24} />
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Mood Insights
        </h3>
      </div>
      
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border-l-4 ${getInsightColor(insight.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{insight.emoji}</span>
                  <h4 className="font-semibold">{insight.title}</h4>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};