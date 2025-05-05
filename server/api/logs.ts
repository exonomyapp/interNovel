import { serverLogger } from '../utils/logger';

export default defineEventHandler(async (event) => {
  if (event.method === 'GET') {
    // Return and clear the current log buffer
    return serverLogger.flush();
  }
  return { error: 'Method not allowed' };
});