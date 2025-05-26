import { defineEventHandler, parseCookies, setCookie, sendRedirect, getQuery, readBody } from 'h3';

const config = {
  clientId: 'Ov23liMrCpSFajxWzoYp',
  clientSecret: '4473bd898c5b8814a9e223756c82fd7df3de03d6',
  redirectUri: 'http://localhost:3001/auth/callback'
};

export default defineEventHandler(async (event) => {
  const path = event.path || '';
  console.log('Auth path:', path); // Debug log

  // Handle initial GitHub OAuth redirect
  if (path === '/api/auth/login') {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=repo user`;
    return sendRedirect(event, authUrl);
  }

  // Handle GitHub callback
  if (path.includes('/auth/callback')) {
    console.log('Handling callback with method:', event.method);
    let code;
    
    if (event.method === 'POST') {
      const body = await readBody(event);
      code = body.code;
      console.log('Received code from POST body:', code);
    } else {
      const query = getQuery(event);
      code = query.code;
      console.log('Received code from query:', code);
    }

    if (!code) {
      console.error('No code provided in request');
      throw new Error('No code provided');
    }

    try {
      console.log('Attempting to exchange code for token...');
      // Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code: code,
          redirect_uri: config.redirectUri
        })
      });

      if (!tokenResponse.ok) {
        console.error('Token exchange failed:', {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText
        });
        throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();
      console.log('Token response received:', {
        hasAccessToken: !!tokenData.access_token,
        error: tokenData.error,
        errorDescription: tokenData.error_description
      });
      
      if (tokenData.error) {
        console.error('GitHub token error:', tokenData);
        throw new Error(tokenData.error_description || 'Failed to get access token');
      }

      // Set token in cookie
      setCookie(event, 'github_access_token', tokenData.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });

      if (event.method === 'GET') {
        // If it's a GET request (direct callback), redirect to home with token
        return sendRedirect(event, `/?token=${tokenData.access_token}`);
      }

      // For POST requests, return token data
      return {
        access_token: tokenData.access_token,
        token_type: tokenData.token_type
      };
    } catch (error) {
      console.error('Auth error:', error);
      if (event.method === 'GET') {
        return sendRedirect(event, '/?error=auth_failed');
      }
      throw error; // Throw the actual error for better debugging
    }
  }

  // Get current user's token
  if (path === '/api/auth/token') {
    const cookies = parseCookies(event);
    return { token: cookies.github_access_token || null };
  }

  // Handle logout
  if (path === '/api/auth/logout') {
    setCookie(event, 'github_access_token', '', {
      maxAge: 0,
      httpOnly: true
    });
    return sendRedirect(event, '/');
  }

  console.error('Invalid auth endpoint:', path);
  throw new Error('Invalid auth endpoint');
}); 