declare module '~/server/db' {
  import { NodePgDatabase } from 'drizzle-orm/node-postgres';
  export const db: NodePgDatabase;
}

declare module '~/server/db/schema' {
  export * from '~/server/db/schema';
}