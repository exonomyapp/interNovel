import { defineEventHandler, sendRedirect, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
  const path = event.path || '';
  
  // Redirect /auth/callback to /api/auth/callback
  if (path === '/auth/callback') {
    const query = getQuery(event);
    const queryString = new URLSearchParams(query as Record<string, string>).toString();
    const redirectUrl = `/api/auth/callback${queryString ? `?${queryString}` : ''}`;
    return sendRedirect(event, redirectUrl);
  }
}); 