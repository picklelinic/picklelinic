import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

/*
 * Connection pooling tuned for frequent, high-volume reads & writes.
 * A single pooled client is reused across the app (cached on globalThis
 * to survive HMR in development).
 */
const globalForDb = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.pgClient ??
  postgres(connectionString, {
    max: 20, // pool size
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgClient = client;
}

export const db = drizzle(client, { schema });
export type DB = typeof db;
export { schema };
