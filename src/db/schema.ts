import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const deltaForceTable = sqliteTable("delta_force_table", {
  id: int().primaryKey({ autoIncrement: true }),
  studentId: text().notNull(),
  firstName: text().notNull(),
  lastName: text().notNull(),
  role: text({
    enum: [
      "general",
      "it",
      "event",
      "finance",
      "logistics",
      "marketing",
      "relations",
      "staff",
    ],
  }).notNull(),
  email: text().notNull().unique(),
  linkedin: text().notNull(),
});
