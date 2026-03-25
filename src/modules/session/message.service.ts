import type { Session } from './session.service'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { messages } from '../../db/schema/messages'
import { sessions } from '../../db/schema/sessions'

export class Message {
  constructor(private session: Session) {}

  async create(senderId: string, content: string) {
    return await db.transaction(async (tx) => {
      const [newMessage] = await tx
        .insert(messages)
        .values({
          senderId,
          sessionId: this.session.id,
          content,
        })
        .returning()

      await tx
        .update(sessions)
        .set({ updated_at: new Date() })
        .where(eq(sessions.id, this.session.id))

      return newMessage
    })
  }

  static async createMessage(
    userId: string,
    sessionId: string,
    content: string,
  ) {
    return await db.transaction(async (tx) => {
      const [newMessage] = await tx
        .insert(messages)
        .values({
          senderId: userId,
          sessionId,
          content,
        })
        .returning()

      await tx
        .update(sessions)
        .set({ updated_at: new Date() })
        .where(eq(sessions.id, sessionId))

      return newMessage
    })
  }

  static async updateMessage(
    sessionId: string,
    messageId: string,
    content: string,
  ) {
    return await db.transaction(async (tx) => {
      const [updateMessage] = await tx
        .update(messages)
        .set({ content })
        .where(eq(messages.id, messageId))
        .returning()

      await tx
        .update(sessions)
        .set({ updated_at: new Date() })
        .where(eq(sessions.id, sessionId))

      return updateMessage
    })
  }
}
