import { db } from '~/server/utils/db';
import { travelTrunks } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const characterId = getRouterParam(event, 'characterId');
  if (!characterId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Character ID is required',
    });
  }
  const trunkItems = await db.select().from(travelTrunks).where(eq(travelTrunks.characterId, parseInt(characterId)));
  return trunkItems;
});