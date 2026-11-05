import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

/**
 * Creates a Drizzle client bound to a local SQLite file (via libsql).
 *
 * The file name can be overridden with the DB_FILE_NAME environment variable
 * (expected format: `file:local.db`). Defaults keep the demo working without
 * any configuration.
 */
export function createDb(fileName = process.env.DB_FILE_NAME ?? "file:local.db") {
  const client = createClient({ url: fileName });
  return drizzle({ client });
}

export type Database = ReturnType<typeof createDb>;
