import type { ChatBody } from './session.model'
import { parsePipeline } from '../../utils/parsePipeline'
import { Message } from './message.service'
import { Session } from './session.service'

export abstract class SessionController {
  static async chat(userId: string, sessionId: string | undefined, { text }: ChatBody) {
    const session = new Session(userId, sessionId)
    const message = new Message(session)

    // 创建用户消息
    const { id: userMessageId } = await message.create(userId, JSON.stringify({
      stage: 'user-text',
      content: text,
    }))

    // 创建机器人回复消息
    const { id: botMessageId } = await message.create('bot-id', JSON.stringify({
      stage: 'bot-text',
      content: '正在思考中...',
    }))

    processChat(session, botMessageId, text).catch((error) => {
      console.error('[Chat Error]', error)
    })

    return { sessionId: session.id, userMessageId, botMessageId }
  }
}

async function processChat(session: Session, botMessageId: string, text: string) {
  try {
    const result = (await parsePipeline(session.id, text)).data
    const newMessage = await Message.updateMessage(session.id, botMessageId, JSON.stringify(result))
    console.log(newMessage)
  }
  catch (error) {
    console.error('[ParsePipeline Error]', error)
    // 更新 bot 消息为错误状态
    await Message.updateMessage(session.id, botMessageId, JSON.stringify({
      stage: 'bot-error',
      content: '处理失败，请重试',
    }))
  }
}
