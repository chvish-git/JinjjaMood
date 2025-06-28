import React, { useState, useEffect } from 'react';
import { ArrowRight, Moon, Sun } from 'lucide-react';
import { MoodCheck } from './pages/MoodCheck';
import { Results } from './pages/Results';
import { MoodHistory } from './pages/MoodHistory';

const memeLines = [
  "Your vibe is valid. Even if it's unhinged.",
  "Let your mood cook. We'll track it.",
  "Jinjja feelings? Let's log that chaos.",
  "Built for sad girls, sleepy boys, and everyone in between.",
  "Real vibes only. No toxic positivity here."
];

type Page = 'landing' | 'mood' | 'results' | 'history';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [currentMemeIndex, setCurrentMemeIndex] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const interval = setInterval(() => {
      setCurrentMemeIndex((prev) => (prev + 1) % memeLines.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleStartJourney = () => {
    setCurrentPage('mood');
  };

  const handleMoodSubmit = () => {
    setCurrentPage('results');
  };

  const handleBackToHome = () => {
    setCurrentPage('landing');
  };

  const handleNewMoodCheck = () => {
    setCurrentPage('mood');
  };

  const handleViewHistory = () => {
    setCurrentPage('history');
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  if (currentPage === 'mood') {
    return (
      <>
        <MoodCheck 
          isDark={isDark}
          onBack={handleBackToHome}
          onSubmit={handleMoodSubmit}
        />
        {/* Bolt.new Badge */}
        <a
          href="https://bolt.new"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-3 right-3 z-50 transition-all duration-300 hover:scale-105 opacity-80 hover:opacity-100"
        >
          <img
            src="/Copy of logotext_poweredby_360w.png"
            alt="Built with Bolt"
            className="w-24 h-auto cursor-pointer"
          />
        </a>
      </>
    );
  }

  if (currentPage === 'results') {
    return (
      <>
        <Results 
          isDark={isDark}
          onBack={handleBackToHome}
          onNewMood={handleNewMoodCheck}
          onViewHistory={handleViewHistory}
        />
        {/* Bolt.new Badge */}
        <a
          href="https://bolt.new"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-3 right-3 z-50 transition-all duration-300 hover:scale-105 opacity-80 hover:opacity-100"
        >
          <img
            src="/Copy of logotext_poweredby_360w.png"
            alt="Built with Bolt"
            className="w-24 h-auto cursor-pointer"
          />
        </a>
      </>
    );
  }

  if (currentPage === 'history') {
    return (
      <>
        <MoodHistory 
          isDark={isDark}
          onBack={handleBackToHome}
          onNewMood={handleNewMoodCheck}
        />
        {/* Bolt.new Badge */}
        <a
          href="https://bolt.new"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-3 right-3 z-50 transition-all duration-300 hover:scale-105 opacity-80 hover:opacity-100"
        >
          <img
            src="/Copy of logotext_poweredby_360w.png"
            alt="Built with Bolt"
            className="w-24 h-auto cursor-pointer"
          />
        </a>
      </>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-1000 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100'
    }`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl animate-pulse ${
          isDark ? 'bg-purple-500' : 'bg-pink-300'
        }`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse delay-1000 ${
          isDark ? 'bg-blue-500' : 'bg-blue-300'
        }`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-10 blur-3xl animate-pulse delay-2000 ${
          isDark ? 'bg-pink-500' : 'bg-purple-300'
        }`}></div>
      </div>

      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
            isDark 
              ? 'bg-white/10 text-white hover:bg-white/20' 
              : 'bg-black/10 text-gray-800 hover:bg-black/20'
          }`}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Header */}
        <div className={`text-center mb-8 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className={`text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r ${
            isDark 
              ? 'from-pink-400 via-purple-400 to-blue-400' 
              : 'from-pink-600 via-purple-600 to-blue-600'
          } bg-clip-text text-transparent animate-pulse`}>
            JinjjaMood
          </h1>
          
          <p className={`text-sm md:text-base font-light tracking-wider ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            jinjja → real/really
          </p>
        </div>

        {/* Dynamic meme line */}
        <div className={`text-center mb-12 h-16 flex items-center justify-center transform transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <p className={`text-lg md:text-xl font-medium max-w-2xl px-4 transition-all duration-500 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            {memeLines[currentMemeIndex]}
          </p>
        </div>

        {/* CTA Button */}
        <div className={`transform transition-all duration-1000 delay-500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <button
            onClick={handleStartJourney}
            className={`group relative px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
              isDark 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-400 hover:to-purple-500' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
            }`}
          >
            <span className="flex items-center gap-2">
              Start the Jinjja Journey
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            
            {/* Glow effect */}
            <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isDark 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 blur-xl' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 blur-xl'
            }`}></div>
          </button>
        </div>

        {/* Footer */}
        <div className={`absolute bottom-6 text-center transform transition-all duration-1000 delay-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Made with too many feelings + Bolt.new
          </p>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full opacity-30 animate-bounce ${
              isDark ? 'bg-white' : 'bg-purple-400'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Bolt.new Badge */}
      <a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-3 right-3 z-50 transition-all duration-300 hover:scale-105 opacity-80 hover:opacity-100"
      >
        <img
          src="/Copy of logotext_poweredby_360w.png"
          alt="Built with Bolt"
          className="w-24 h-auto cursor-pointer"
        />
      </a>
    </div>
  );
}

export default App;