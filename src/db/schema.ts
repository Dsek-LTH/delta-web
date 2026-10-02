import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { deltaForceRoles } from "@/constants";

export const deltaForceTable = sqliteTable("delta_force_table", {
  id: int().primaryKey({ autoIncrement: true }),
  studentId: text().notNull(),
  firstName: text().notNull(),
  lastName: text().notNull(),
  role: text({
    enum: deltaForceRoles,
  }).notNull(),
  email: text().notNull().unique(),
  linkedin: text().notNull(),
});
