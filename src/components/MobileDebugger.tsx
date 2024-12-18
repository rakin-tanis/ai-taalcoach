'use client'

import React, { useState, useEffect } from 'react';

interface DebugInfo {
  timestamp: string;
  type: 'log' | 'error' | 'warn';
  message: string;
}

const MobileDebugger: React.FC = () => {
  const [debugLogs, setDebugLogs] = useState<DebugInfo[]>([]);

  useEffect(() => {
    // Intercept console methods
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.log = (...args) => {
      setDebugLogs(prev => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          type: 'log',
          message: args.map(arg => JSON.stringify(arg)).join(' ')
        }
      ]);
      originalConsoleLog(...args);
    };

    console.error = (...args) => {
      setDebugLogs(prev => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          type: 'error',
          message: args.map(arg => JSON.stringify(arg)).join(' ')
        }
      ]);
      originalConsoleError(...args);
    };

    console.warn = (...args) => {
      setDebugLogs(prev => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          type: 'warn',
          message: args.map(arg => JSON.stringify(arg)).join(' ')
        }
      ]);
      originalConsoleWarn(...args);
    };

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  return (
    <div
      className="
      bg-black text-white p-2 z-50 overflow-auto max-h-[200px] w-full max-w-[550px] mt-10"
    >
      {debugLogs.map((log, index) => (
        <div
          key={index}
          className={`
            text-xs p-1 
            ${log.type === 'error' ? 'text-red-500' :
              log.type === 'warn' ? 'text-yellow-500' : 'text-white'}
          `}
        >
          <span className="mr-2 text-gray-400">{log.timestamp}</span>
          {log.message}
        </div>
      ))}
    </div>
  );
};

export default MobileDebugger