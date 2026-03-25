import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { sessions } from './sessions'

export const models = sqliteTable('models', {
  id: text('id')
    .$defaultFn(() => nanoid())
    .primaryKey(),
  name: text('name').notNull(),
  content: text('content', { mode: 'json' }).notNull(),
})

export const rags = sqliteTable('rags', {
  id: text('id')
    .$defaultFn(() => nanoid())
    .primaryKey(),
  name: text('name').notNull(),
  content: text('content', { mode: 'json' }).notNull(),
})

export const governances = sqliteTable('governances', {
  id: text('id')
    .$defaultFn(() => nanoid())
    .primaryKey(),
  name: text('name').notNull(),
  content: text('content', { mode: 'json' }).notNull(),
})

export const tasks = sqliteTable('tasks', {
  id: text('id')
    .$defaultFn(() => nanoid())
    .primaryKey(),
  sessionId: text('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  modelId: text('model_id')
    .notNull()
    .references(() => models.id, { onDelete: 'cascade' }),
  ragId: text('rag_id')
    .notNull()
    .references(() => rags.id, { onDelete: 'cascade' }),

  type: text('type', { enum: ['rag', 'train'] }).notNull(),

  deleted_at: integer('deleted_at', { mode: 'timestamp_ms' }),
  created_at: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
})

export const tasksRelations = relations(tasks, ({ one, many,
}) => ({
  session: one(sessions, {
    fields: [tasks.sessionId],
    references: [sessions.id],
  }),
  model: one(models, {
    fields: [tasks.modelId],
    references: [models.id],
  }),
  rag: one(rags, {
    fields: [tasks.ragId],
    references: [rags.id],
  }),
  governances: many(governances),
}))
