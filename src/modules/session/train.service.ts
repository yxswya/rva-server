import type { CreateTrainBody } from './session.model'
import { db } from '../../db'
import { governances, models, rags } from '../../db/schema'
import { eventBus } from '../../utils/eventBus'
import { governanceRagTrain } from '../../utils/yt/governanceRagTrain'
import { registerModel } from '../../utils/yt/model'
import { Message } from './message.service'
import { Session } from './session.service'

export class TrainService {
  static async start(userId: string, sessionId: string | undefined, body: CreateTrainBody) {
    if (!sessionId)
      return

    console.log(sessionId)
    const session = new Session(userId, sessionId)
    await session.ensureSession()
    console.log(session.id)

    const message = new Message(session)
    const newMessage = await message.create('bot-id', JSON.stringify({
      stage: 'model-train',
      status: 1,
      statusMessage: '训练中...',
      content: '',
    }))
    eventBus.emit(`chat-${session.id}`, newMessage)

    async function doWork() {
      const { answer, sources } = await governanceRagTrain(body.files, body.rag_cfg, body.train_cfg)

      const updateMessage2 = await message.update(JSON.stringify({
        stage: 'model-train',
        status: 2,
        statusMessage: '整理治理文件中...',
        content: '',
      }))
      eventBus.emit(`chat-${session.id}`, updateMessage2)

      // 事务处理：确保 governances、rags、models 要么全部成功，要么全部回滚
      const modelUri = sources?.[1]
      if (!modelUri) {
        throw new Error('训练完成但未获取到有效的模型路径 (sources[1] 不存在)')
      }

      await db.transaction(async (tx) => {
        const promises = answer.governance.map((gov) => {
          return tx.insert(governances).values({
            name: gov.summary.name,
            content: gov,
          })
        })
        await Promise.all(promises)

        await tx.insert(rags).values({
          name: answer.rag.run_id,
          content: answer.rag,
        })

        const modelContent = await registerModel({
          model_uri: modelUri,
          task: 'chat',
          model_type: 'causal-lm',
          note: '我的训练模型',
        })

        await tx.insert(models).values({
          name: answer.train.run_id,
          content: modelContent,
        })
      })

      const updateMessage3 = await message.update(JSON.stringify({
        stage: 'model-train',
        status: 3,
        statusMessage: '知识库构建中...',
        content: '',
      }))
      console.log(`chat-${session.id}`, updateMessage3)
      eventBus.emit(`chat-${session.id}`, updateMessage3)

      const updateMessage4 = await message.update(JSON.stringify({
        stage: 'model-train',
        status: 4,
        statusMessage: '模型注册中...',
        content: '',
      }))
      eventBus.emit(`chat-${session.id}`, updateMessage4)

      const updateMessage5 = await message.update(JSON.stringify({
        stage: 'model-train',
        status: 5,
        statusMessage: '训练结束',
        content: '',
      }))
      eventBus.emit(`chat-${session.id}`, updateMessage5)

      console.log(sources)
    }

    doWork().catch(async (error) => {
      console.error('训练任务失败:', error)
      const errorMsg = await message.update(JSON.stringify({
        stage: 'model-train',
        status: -1,
        statusMessage: `训练失败: ${error.message}`,
        content: '',
      }))
      eventBus.emit(`chat-${session.id}`, errorMsg)
    })

    return newMessage
  }
}
