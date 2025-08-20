import { db } from '../../utils/db';
import { characters } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async () => {
  return await db.select().from(characters).where(eq(characters.listed, true));
});