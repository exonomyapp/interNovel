import { db } from '../../utils/db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const user = event.context.user;

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  try {
    const userProfile = await db.select({
      did: users.did,
      email: users.email,
      name: users.name,
      avatar_url: users.avatarUrl,
    }).from(users).where(eq(users.id, user.id));

    if (userProfile.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Profile not found',
      });
    }

    return userProfile[0];
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching profile',
    });
  }
});