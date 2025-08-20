import { db } from '../../utils/db';
import { characters, eq } from '../../db/schema';

export default defineEventHandler(async (event) => {
  const characterId = getRouterParam(event, 'characterId');
  const { listed } = await readBody(event);

  if (!characterId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Character ID is required',
    });
  }

  await db.update(characters).set({ listed }).where(eq(characters.id, parseInt(characterId)));

  return { success: true };
});