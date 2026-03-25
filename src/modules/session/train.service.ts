import type { CreateTrainBody } from './session.model'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { governances, models, rags, tasks, TrainTaskStatus } from '../../db/schema'
import { eventBus } from '../../utils/eventBus'
import { governanceRagTrain } from '../../utils/yt/governanceRagTrain'
import { registerModel } from '../../utils/yt/model'
import { Message } from './message.service'
import { Session } from './session.service'
import { createTrainMessage } from './train.types'

export class TrainService {
  /**
   * 启动训练任务
   */
  static async start(userId: string, sessionId: string | undefined, body: CreateTrainBody) {
    if (!sessionId)
      return

    const session = new Session(userId, sessionId)
    await session.ensureSession()

    // 1. 创建消息和任务记录
    const message = new Message(session)
    const newMessage = await message.create(
      userId,
      createTrainMessage(TrainTaskStatus.Training),
    )
    eventBus.emit(`chat-${session.id}`, newMessage)

    // 2. 创建任务记录（持久化）
    const [taskRecord] = await db.insert(tasks).values({
      sessionId: session.id,
      type: 'train',
      status: TrainTaskStatus.Training,
    }).returning()

    // 3. 异步执行训练任务
    this.executeTrainTask({
      taskRecord,
      message,
      session,
      body,
    }).catch(console.error)

    return newMessage
  }

  /**
   * 执行训练任务的核心逻辑
   */
  private static async executeTrainTask(params: {
    taskRecord: typeof tasks.$inferSelect
    message: Message
    session: Session
    body: CreateTrainBody
  }) {
    const { taskRecord, message, session, body } = params

    try {
      // Step 1: 调用外部训练 API
      const { answer, sources } = await governanceRagTrain(
        body.files,
        body.rag_cfg,
        body.train_cfg,
      )

      // Step 2: 检查模型路径
      const modelUri = sources?.[1]
      if (!modelUri) {
        throw new Error('训练完成但未获取到有效的模型路径 (sources[1] 不存在)')
      }

      // 幂等性检查：如果 runId 已存在，说明任务已处理
      if (answer.train.run_id) {
        const existingTask = await db.query.tasks.findFirst({
          where: eq(tasks.runId, answer.train.run_id),
        })
        if (existingTask && existingTask.id !== taskRecord.id) {
          throw new Error(`任务已存在: runId=${answer.train.run_id}`)
        }
      }

      // Step 3: 更新状态 - 整理治理文件中
      await this.updateTaskAndNotify({
        taskId: taskRecord.id,
        message,
        sessionId: session.id,
        status: TrainTaskStatus.OrganizingGovernance,
        runId: answer.train.run_id,
      })

      // Step 4: 更新状态 - 知识库构建中
      await this.updateTaskAndNotify({
        taskId: taskRecord.id,
        message,
        sessionId: session.id,
        status: TrainTaskStatus.BuildingRag,
      })

      // Step 5: 注册模型（外部 API，在事务外执行）
      await this.updateTaskAndNotify({
        taskId: taskRecord.id,
        message,
        sessionId: session.id,
        status: TrainTaskStatus.RegisteringModel,
      })

      const modelContent = await registerModel({
        model_uri: modelUri,
        task: body.train_cfg.method ?? 'chat',
        model_type: 'causal-lm',
        note: `训练模型 - ${answer.train.run_id}`,
      })

      // Step 6: 事务写入数据库（仅本地操作）
      const { modelId, ragId } = await db.transaction(async (tx) => {
        // 插入治理文件
        const governancePromises = answer.governance.map((gov) => {
          return tx.insert(governances).values({
            taskId: taskRecord.id,
            name: gov.summary.name,
            content: gov,
          })
        })
        await Promise.all(governancePromises)

        // 插入 RAG
        const [ragRecord] = await tx.insert(rags).values({
          name: answer.rag.run_id,
          content: answer.rag,
        }).returning()

        // 插入模型
        const [modelRecord] = await tx.insert(models).values({
          name: answer.train.run_id,
          content: modelContent,
        }).returning()

        // 更新任务关联
        await tx.update(tasks)
          .set({
            modelId: modelRecord.id,
            ragId: ragRecord.id,
          })
          .where(eq(tasks.id, taskRecord.id))

        return { modelId: modelRecord.id, ragId: ragRecord.id }
      })

      // Step 7: 完成
      await this.updateTaskAndNotify({
        taskId: taskRecord.id,
        message,
        sessionId: session.id,
        status: TrainTaskStatus.Completed,
        modelId,
        ragId,
      })

      console.log(`[Train] Task completed: ${taskRecord.id}`, { sources, modelId, ragId })
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('[Train] Task failed:', errorMessage)

      // 更新任务状态为失败
      await db.update(tasks)
        .set({
          status: TrainTaskStatus.Failed,
          errorMessage,
        })
        .where(eq(tasks.id, taskRecord.id))

      // 通知前端
      const failedMsg = await message.update(
        createTrainMessage(TrainTaskStatus.Failed, `训练失败: ${errorMessage}`),
      )
      eventBus.emit(`chat-${session.id}`, failedMsg)
    }
  }

  /**
   * 更新任务状态并通知前端
   */
  private static async updateTaskAndNotify(params: {
    taskId: string
    message: Message
    sessionId: string
    status: TrainTaskStatus
    runId?: string
    modelId?: string
    ragId?: string
  }) {
    const { taskId, message, sessionId, status, runId, modelId, ragId } = params

    // 更新数据库
    await db.update(tasks)
      .set({
        status,
        ...(runId && { runId }),
        ...(modelId && { modelId }),
        ...(ragId && { ragId }),
      })
      .where(eq(tasks.id, taskId))

    // 通知前端
    const updatedMsg = await message.update(createTrainMessage(status))
    eventBus.emit(`chat-${sessionId}`, updatedMsg)
  }

  /**
   * 恢复未完成的任务（服务启动时调用）
   */
  static async recoverPendingTasks() {
    const pendingTasks = await db.query.tasks.findMany({
      where: (tasks, { inArray }) => inArray(tasks.status, [
        TrainTaskStatus.Pending,
        TrainTaskStatus.Training,
        TrainTaskStatus.OrganizingGovernance,
        TrainTaskStatus.BuildingRag,
        TrainTaskStatus.RegisteringModel,
      ]),
    })

    console.log(`[Train] Found ${pendingTasks.length} pending tasks to recover`)

    // 这里可以根据需要实现任务恢复逻辑
    // 由于训练任务涉及外部 API 和文件，恢复逻辑需要根据具体业务场景设计
    // 简单做法：将未完成任务标记为失败
    for (const task of pendingTasks) {
      await db.update(tasks)
        .set({
          status: TrainTaskStatus.Failed,
          errorMessage: '服务重启，任务中断',
        })
        .where(eq(tasks.id, task.id))
    }
  }
}
