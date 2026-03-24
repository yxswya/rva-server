import { SessionService } from "./session.service";
import { ChatBody } from "./session.model";
import { nanoid } from "nanoid";
import { parsePipeline } from "../../utils/parsePipeline";

export abstract class SessionController {

  static async createSession(userId: string) {
    const { id: sessionId } = await SessionService.createSession(userId, '会话-' + nanoid())
    return sessionId
  }

  static async chat(userId: string, sessionId: string | undefined, { text }: ChatBody) {
    if (!sessionId) {
      sessionId = await SessionController.createSession(userId)
    }

    // 创建用户消息
    const { id: userMessageId } = await SessionService.createMessage(userId, sessionId, JSON.stringify({
      stage: 'user-text',
      content: text
    }));

    // 创建机器人回复消息
    const { id: botMessageId } = await SessionService.createMessage('bot-id', sessionId, JSON.stringify({
      stage: 'bot-text',
      content: '正在思考中...'
    }))

    processChat(sessionId, botMessageId, text).catch((error) => {
      console.error('[Chat Error]', error)
    })
  }
}

async function processChat(sessionId: string, botMessageId: string, text: string) {
  try {
    const result = (await parsePipeline(sessionId, text)).data
    const newMessage = await SessionService.updateMessage(sessionId, botMessageId, JSON.stringify(result))
    console.log(newMessage)
  }
  catch (error) {
    console.error('[ParsePipeline Error]', error)
    throw error
  }
}