import React, { useState, useEffect, useCallback } from 'react';

const QuestionTimer = ({ 
  duration = 30, 
  onTimeUp, 
  isActive = true, 
  resetTrigger = 0,
  showTimer = true 
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);

  // Reset timer when resetTrigger changes (new question)
  useEffect(() => {
    setTimeLeft(duration);
    setIsRunning(isActive);
  }, [resetTrigger, duration, isActive]);

  // Timer countdown logic
  useEffect(() => {
    let intervalId;

    if (isRunning && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            setIsRunning(false);
            onTimeUp?.();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft, onTimeUp]);

  // Calculate progress percentage
  const progressPercentage = (timeLeft / duration) * 100;
  
  // Color based on time remaining
  const getTimerColor = () => {
    if (progressPercentage > 60) return 'text-green-500';
    if (progressPercentage > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getCircleColor = () => {
    if (progressPercentage > 60) return 'stroke-green-500';
    if (progressPercentage > 30) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showTimer) return null;

  return (
    <div className="timer-container flex flex-col items-center">
      {/* Circular Progress Timer */}
      <div className="relative w-20 h-20 mb-2">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
          {/* Background circle */}
          <path
            className="text-gray-300 stroke-current"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          {/* Progress circle */}
          <path
            className={`${getCircleColor()} stroke-current transition-all duration-1000 ease-linear`}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${progressPercentage}, 100`}
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        {/* Timer text in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold ${getTimerColor()}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Timer Status */}
      <div className="text-center">
        <div className={`text-xs font-medium ${getTimerColor()}`}>
          {timeLeft === 0 ? 'Time\'s Up!' : 'Time Left'}
        </div>
        {timeLeft <= 10 && timeLeft > 0 && (
          <div className="text-xs text-red-500 animate-pulse mt-1">
            ⚠️ Hurry up!
          </div>
        )}
      </div>

      {/* Pulse animation when time is running out */}
      {timeLeft <= 5 && timeLeft > 0 && (
        <style jsx>{`
          .timer-container {
            animation: pulse-red 1s infinite;
          }
          @keyframes pulse-red {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>
      )}
    </div>
  );
};

export default QuestionTimer;