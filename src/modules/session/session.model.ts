import type { UnwrapSchema } from 'elysia'
import { t } from 'elysia'

// 配置类型定义
const RagCfgSchema = t.Object({
  backend: t.Optional(t.String()),
  embedder: t.Optional(t.String()),
  dim: t.Optional(t.Number()),
  metric: t.Optional(t.String()),
  chunk: t.Optional(t.Object({
    size: t.Number(),
    overlap: t.Number(),
  })),
})

const TrainCfgSchema = t.Object({
  method: t.Optional(t.String()),
  base_model: t.Optional(t.String()),
  epochs: t.Optional(t.Number()),
  batch_size: t.Optional(t.Number()),
  max_seq_len: t.Optional(t.Number()),
})

export const SessionModel = {
  chatBody: t.Object({
    text: t.String(),
  }),
  chatParams: t.Object({
    sessionId: t.Optional(t.String()),
  }),

  createSessionBody: t.Object({
    title: t.String({ minLength: 1, maxLength: 100 }),
  }),
  createSessionResponse: t.Object({
    id: t.String(),
    userId: t.String(),
    title: t.String(),
    deleted_at: t.Union([t.Date(), t.Null()]),
    created_at: t.Date(),
    updated_at: t.Date(),
  }),

  createTrainBody: t.Object({
    files: t.Files({
      minItems: 1,
    }),
    message_id: t.String(),
    title: t.String(),
    rag_cfg: RagCfgSchema,
    train_cfg: TrainCfgSchema,
  }),
}

export type ChatBody = UnwrapSchema<typeof SessionModel.chatBody>
export type CreateSessionBody = UnwrapSchema<typeof SessionModel.createSessionBody>
export type CreateTrainBody = UnwrapSchema<typeof SessionModel.createTrainBody>
