import type { OnlyOne } from './interface'
import type { Session } from './session.service'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '../../db'
import { messages } from '../../db/schema/messages'
import { sessions } from '../../db/schema/sessions'

export class Message implements OnlyOne {
  constructor(
    public session: Session,
    public id: string = nanoid(),
  ) {}

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

  // static async createMessage(
  //   userId: string,
  //   sessionId: string,
  //   content: string,
  // ) {
  //   return await db.transaction(async (tx) => {
  //     const [newMessage] = await tx
  //       .insert(messages)
  //       .values({
  //         senderId: userId,
  //         sessionId,
  //         content,
  //       })
  //       .returning()

  //     await tx
  //       .update(sessions)
  //       .set({ updated_at: new Date() })
  //       .where(eq(sessions.id, sessionId))

  //     return newMessage
  //   })
  // }

  async update(content: string) {
    return await db.transaction(async (tx) => {
      const [updateMessage] = await tx
        .update(messages)
        .set({ content })
        .where(eq(messages.id, this.id))
        .returning()

      await tx
        .update(sessions)
        .set({ updated_at: new Date() })
        .where(eq(sessions.id, this.session.id))

      return updateMessage
    })
  }
}
