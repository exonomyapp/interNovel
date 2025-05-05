import type { LogEntry } from '../db';

// In-memory log buffer for server-side logs
const logBuffer: Omit<LogEntry, 'id'>[] = [];

export const serverLogger = {
  info: (message: string, data?: any) => {
    const entry: Omit<LogEntry, 'id'> = {
      timestamp: new Date().toISOString(),
      type: 'info',
      message,
      details: data,
      source: 'API'
    };
    console.info(`[API INFO] ${message}`, data || '');
    logBuffer.push(entry);
  },
  error: (message: string, error: any) => {
    const entry: Omit<LogEntry, 'id'> = {
      timestamp: new Date().toISOString(),
      type: 'error',
      message,
      details: error,
      source: 'API'
    };
    console.error(`[API ERROR] ${message}`, error);
    logBuffer.push(entry);
  },
  warn: (message: string, data?: any) => {
    const entry: Omit<LogEntry, 'id'> = {
      timestamp: new Date().toISOString(),
      type: 'warning',
      message,
      details: data,
      source: 'API'
    };
    console.warn(`[API WARNING] ${message}`, data || '');
    logBuffer.push(entry);
  },
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      const entry: Omit<LogEntry, 'id'> = {
        timestamp: new Date().toISOString(),
        type: 'debug',
        message,
        details: data,
        source: 'API'
      };
      console.debug(`[API DEBUG] ${message}`, data || '');
      logBuffer.push(entry);
    }
  },
  // Get and clear the buffer
  flush: () => {
    const logs = [...logBuffer];
    logBuffer.length = 0;
    return logs;
  }
};