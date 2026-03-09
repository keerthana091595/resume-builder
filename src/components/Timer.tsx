import React, { useState, useEffect } from 'react';
import { Timer as TimerIcon } from 'lucide-react';

export const Timer = ({ isRunning, resetKey }) => {
  const [seconds, setSeconds] = useState(0);

  // Sync timer with isRunning prop
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Reset internal state when resetKey prop changes
  useEffect(() => {
    setSeconds(0);
  }, [resetKey]);

  return (
    <div style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
      <TimerIcon className={isRunning ? 'animate-pulse' : ''} />
      <span>{seconds}s</span>
    </div>
  );
};