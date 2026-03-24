import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { users } from "./users";

export const messages = sqliteTable("messages", {
  id: text("id")
    .$defaultFn(() => nanoid())
    .primaryKey(),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content", { mode: 'json' }).notNull(),

  deleted_at: integer("deleted_at", { mode: "timestamp_ms" }),
  created_at: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updated_at: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type InsertMessage = typeof messages.$inferInsert
export type SelectMessage = typeof messages.$inferSelect