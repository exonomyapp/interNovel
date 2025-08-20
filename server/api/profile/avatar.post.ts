import { serverSupabaseClient } from '#supabase/server';
import { readMultipartFormData } from 'h3';
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

  const client = await serverSupabaseClient(event);
  const multipart = await readMultipartFormData(event);

  if (!multipart) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: Invalid form data',
    });
  }

  const file = multipart.find((el) => el.name === 'avatar');

  if (!file || !file.data || !file.filename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: Missing avatar file',
    });
  }

  const { error: uploadError } = await client.storage
    .from('avatars')
    .upload(`${user.id}/${file.filename}`, file.data, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error uploading avatar',
    });
  }

  const { data: urlData } = client.storage
    .from('avatars')
    .getPublicUrl(`${user.id}/${file.filename}`);

  try {
    await db.update(users).set({ avatarUrl: urlData.publicUrl }).where(eq(users.id, user.id));
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating user profile',
    });
  }

  return { avatarUrl: urlData.publicUrl };
});