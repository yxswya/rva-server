import type { SelectSession } from '../../db/schema/sessions'
import type { OnlyOne } from './interface'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '../../db'
import { sessions } from '../../db/schema/sessions'

export class Session implements OnlyOne {
  constructor(
    public userId: string,
    public id: string = nanoid(),
  ) {}

  /** 确保会话存在，如果不存在则创建 */
  async ensureSession(): Promise<SelectSession> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, this.id))

    if (session)
      return session

    const [newSession] = await db.insert(sessions).values({
      id: this.id,
      userId: this.userId,
      title: `会话-${nanoid()}`,
    }).returning()

    return newSession
  }

  static async create(userId: string, title: string) {
    const [newSession] = await db
      .insert(sessions)
      .values({ userId, title })
      .returning()
    return newSession
  }

  static async getAllSessionWithMessages() {
    return await db.query.sessions.findMany({
      with: {
        messages: true,
      },
      orderBy: (sessions, { desc }) => [desc(sessions.created_at)],
    })
  }

  static async getSessionWithMessagesById(sessionId: string) {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
      with: {
        messages: true,
      },
      orderBy: (sessions, { desc }) => [desc(sessions.created_at)],
    })
    return session
  }
}
