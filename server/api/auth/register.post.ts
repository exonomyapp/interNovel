import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const { did, publicKey } = await readBody(event);

  if (!did || !publicKey) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing did or publicKey',
    });
  }

  const existingUser = await db.select().from(users).where(eq(users.did, did));

  if (existingUser.length > 0) {
    return existingUser[0];
  }

  const newUser = await db.insert(users).values({ did, publicKey }).returning();

  return newUser[0];
});