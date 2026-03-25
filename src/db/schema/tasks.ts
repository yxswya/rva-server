import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { sessions } from './sessions'

/** 训练任务状态枚举 */
export enum TrainTaskStatus {
  Pending = 0, // 等待中
  Training = 1, // 训练中
  OrganizingGovernance = 2, // 整理治理文件中
  BuildingRag = 3, // 知识库构建中
  RegisteringModel = 4, // 模型注册中
  Completed = 5, // 训练结束
  Failed = -1, // 训练失败
}

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

export const tasks = sqliteTable('tasks', {
  id: text('id')
    .$defaultFn(() => nanoid())
    .primaryKey(),
  sessionId: text('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  modelId: text('model_id')
    .references(() => models.id, { onDelete: 'cascade' }),
  ragId: text('rag_id')
    .references(() => rags.id, { onDelete: 'cascade' }),

  type: text('type', { enum: ['rag', 'train'] }).notNull(),
  runId: text('run_id').unique(), // 用于去重
  status: integer('status', { mode: 'number' })
    .notNull()
    .default(TrainTaskStatus.Pending),
  errorMessage: text('error_message'),

  deleted_at: integer('deleted_at', { mode: 'timestamp_ms' }),
  created_at: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
})

export const governances = sqliteTable('governances', {
  id: text('id')
    .$defaultFn(() => nanoid())
    .primaryKey(),
  taskId: text('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  content: text('content', { mode: 'json' }).notNull(),
})

export const tasksRelations = relations(tasks, ({ one, many }) => ({
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

export const governancesRelations = relations(governances, ({ one }) => ({
  task: one(tasks, {
    fields: [governances.taskId],
    references: [tasks.id],
  }),
}))
