import { defineEventHandler, getRequestHeader } from 'h3';
import { verifySession } from '../utils/session';

export default defineEventHandler(async (event) => {
  const authHeader = getRequestHeader(event, 'authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return;
  }

  const token = authHeader.substring(7);

  try {
    const userId = await verifySession(token);
    if (userId) {
      event.context.user = { id: userId };
    }
  } catch (error) {
    console.error('Invalid token:', error);
  }
};