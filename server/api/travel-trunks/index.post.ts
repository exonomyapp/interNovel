import { db } from '~/server/utils/db';
import { travelTrunks, insertTravelTrunkSchema } from '~/server/db/schema';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const trunkItem = insertTravelTrunkSchema.parse(body);
  const newTrunkItem = await db.insert(travelTrunks).values(trunkItem).returning();
  return newTrunkItem[0];
});