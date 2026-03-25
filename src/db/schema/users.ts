import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'

export const users = sqliteTable(
  'users',
  {
    id: text('id')
      .$defaultFn(() => nanoid())
      .primaryKey(),
    username: text('username').notNull(),
    passworHash: text('password_hash').notNull(),
    email: text('email').unique(),

    deletedAt: integer('deleted_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  table => [
    index('username_idx').on(table.username),
    index('email_idx').on(table.email),
    index('deleted_at_idx').on(table.deletedAt),
  ],
)
