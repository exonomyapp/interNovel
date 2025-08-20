import { pgTable, serial, text, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const users = pgTable('users', {
  id: serial('id').primaryKey(),
  did: varchar('did', { length: 256 }).notNull().unique(),
  publicKey: text('publicKey').notNull(),
  email: text('email').unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const characters = pgTable('characters', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  bio: text('bio').notNull(),
  ownerId: serial('owner_id').references(() => users.id).notNull(),
  listed: boolean('listed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

const travelTrunks = pgTable('travel_trunks', {
  id: serial('id').primaryKey(),
  characterId: serial('character_id').references(() => characters.id).notNull(),
  narrativeSample: text('narrative_sample').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

const proposals = pgTable('proposals', {
  id: serial('id').primaryKey(),
  proposerId: serial('proposer_id').references(() => users.id).notNull(),
  characterId: serial('character_id').references(() => characters.id).notNull(),
  proposal: text('proposal').notNull(),
  status: varchar('status', { length: 256 }).default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

const insertCharacterSchema = z.object({
  name: z.string(),
  bio: z.string(),
  ownerId: z.number(),
  listed: z.boolean().optional()
});

const insertTravelTrunkSchema = z.object({
  characterId: z.number(),
  narrativeSample: z.string()
});

export { users, characters, travelTrunks, proposals, insertCharacterSchema, insertTravelTrunkSchema, eq };