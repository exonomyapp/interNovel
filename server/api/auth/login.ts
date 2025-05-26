// server/api/auth/login.ts

import { defineEventHandler, sendRedirect } from 'h3'

// Use environment variables for security
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!
const REDIRECT_URI = process.env.GITHUB_CALLBACK_URL!

export default defineEventHandler(async (event) => {
  // Build GitHub authorization URL
  const githubAuthUrl = `https://github.com/login/oauth/authorize` +
    `?client_id=${GITHUB_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=repo,user`

  // Redirect the user to GitHub's OAuth screen
  return sendRedirect(event, githubAuthUrl)
})
