import type { ChatBody } from './session.model'
import { parsePipeline } from '../../utils/parsePipeline'
import { Message } from './message.service'
import { Session } from './session.service'

export abstract class SessionController {
  static async chat(userId: string, sessionId: string | undefined, { text }: ChatBody) {
    const session = new Session(userId, sessionId)

    // 创建用户消息
    const userMessage = new Message(session)
    const { id: userMessageId } = await userMessage.create(userId, JSON.stringify({
      stage: 'user-text',
      content: text,
    }))

    // 创建机器人回复消息
    const botMessage = new Message(session)
    const { id: botMessageId } = await botMessage.create('bot-id', JSON.stringify({
      stage: 'bot-text',
      content: '正在思考中...',
    }))

    processChat(botMessage.session.id, text)
      .then((data) => {
        botMessage.update(JSON.stringify(data))
      })
      .catch((error) => {
        // 更新 bot 消息为错误状态
        console.error('[Chat Error]', error)
        botMessage.update(JSON.stringify({
          stage: 'bot-error',
          content: '处理失败，请重试',
        }))
      })

    return { sessionId: session.id, userMessageId, botMessageId }
  }
}

async function processChat(sessionId: string, text: string) {
  try {
    const result = await parsePipeline(sessionId, text)
    return result.data
  }
  catch (error) {
    console.error('[ParsePipeline Error]', error)
  }
}
