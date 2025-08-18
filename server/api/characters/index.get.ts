import { db } from '../../db';
import { characters } from '../../db/schema';

export default defineEventHandler(async (event) => {
  const allCharacters = await db.select().from(characters);
  return allCharacters;
});