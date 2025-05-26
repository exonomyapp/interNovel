// server/api/github-callback.ts

import { defineEventHandler, readBody, createError } from 'h3'
import { Octokit } from '@octokit/rest'
import { $fetch } from 'ofetch'

// Environment variables
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const code = body.code

  if (!code || typeof code !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid code' })
  }

  // Step 1: Exchange the code for an access token
  const tokenResponse = await $fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    },
  })

  const { access_token, error: tokenError } = tokenResponse as {
    access_token?: string
    error?: string
  }

  if (!access_token) {
    throw createError({
      statusCode: 401,
      statusMessage: tokenError || 'Failed to retrieve access token',
    })
  }

  // Optional: Get GitHub user info
  const octokit = new Octokit({ auth: access_token })
  const { data: user } = await octokit.rest.users.getAuthenticated()

  console.log('Authenticated GitHub user:', user.login)

  // Optionally: store user data in DB or session here

  // Return token to client
  return {
    access_token,
    user: {
      login: user.login,
      id: user.id,
      avatar_url: user.avatar_url,
    },
  }
})
