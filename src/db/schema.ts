import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const users = sqliteTable(
  "users",
  {
    id: text("id")
      .$defaultFn(() => nanoid())
      .primaryKey(),
    username: text("username").notNull(),
    password_hash: text("password_hash").notNull(),
    email: text("email").unique(),

    deleted_at: integer("deleted_at", { mode: "timestamp_ms" }),
    created_at: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updated_at: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("username_idx").on(table.username),
    index("email_idx").on(table.email),
    index("deleted_at_idx").on(table.deleted_at),
  ],
);
