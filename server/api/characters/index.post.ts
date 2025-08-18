import { db } from '~/server/db';
import { characters, insertCharacterSchema } from '~/server/db/schema';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const character = insertCharacterSchema.parse(body);
  const newCharacter = await db.insert(characters).values(character).returning();
  return newCharacter[0];
});