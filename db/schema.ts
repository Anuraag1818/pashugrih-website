import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const siteContent = pgTable("site_content", {
  id: integer("id").primaryKey(),
  data: text("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
