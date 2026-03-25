import type { ChatBody, CreateSessionBody } from './session.model'
import { eventBus } from '../../utils/eventBus'
import { parsePipeline } from '../../utils/yt/parsePipeline'
import { Message } from './message.service'
import { Session } from './session.service'

export abstract class SessionController {
  static async create(userId: string, body: CreateSessionBody) {
    return Session.create(userId, body.title)
  }

  static async chat(userId: string, sessionId: string | undefined, { text }: ChatBody) {
    const session = new Session(userId, sessionId)
    await session.ensureSession()

    // 创建用户消息
    const userMessage = new Message(session)
    const userMessageData = await userMessage.create(userId, JSON.stringify({
      stage: 'user-text',
      content: text,
    }))
    eventBus.emit(`chat-${session.id}`, userMessageData)

    // 创建机器人回复消息
    const botMessage = new Message(session)
    const botMessageData = await botMessage.create('bot-id', JSON.stringify({
      stage: 'bot-text',
      content: '正在思考中...',
    }))
    eventBus.emit(`chat-${session.id}`, botMessageData)

    // 异步的对意图识别进行处理
    parsePipeline(botMessage.session.id, text)
      .then(async (data) => {
        const botMessageData = await botMessage.update(JSON.stringify(data))
        eventBus.emit(`chat-${session.id}`, botMessageData)
      })
      .catch(async (error) => {
        // 更新 bot 消息为错误状态
        console.error('[Chat Error]', error)
        const botMessageData = await botMessage.update(JSON.stringify({
          stage: 'bot-error',
          content: '处理失败，请重试',
        }))
        eventBus.emit(`chat-${session.id}`, botMessageData)
      })

    return { sessionId: session.id, userMessageData, botMessageData }
  }

  static async getData(sessionId: string | undefined) {
    if (sessionId) {
      const data = await Session.getSessionWithMessagesById(sessionId)
      return data
    }

    const data = await Session.getAllSessionWithMessages()
    return data
  }
}
