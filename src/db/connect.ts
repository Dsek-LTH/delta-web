import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "@/envvars";

const dbFileName = env.DB_FILE_NAME;

if (!dbFileName) {
  throw new Error("DB_FILE_NAME is required");
}

const client = createClient({
  url: dbFileName.startsWith("file:") ? dbFileName : `file:${dbFileName}`,
});
export const db = drizzle({ client });
