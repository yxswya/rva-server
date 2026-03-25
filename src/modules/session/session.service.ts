import { nanoid } from 'nanoid'
import { db } from '../../db'
import { sessions } from '../../db/schema/sessions'

export class Session {
  id: string

  constructor(public userId: string, id: string | undefined) {
    this.id = id || nanoid()
  }

  static async createSession(userId: string, title: string) {
    const [newSession] = await db
      .insert(sessions)
      .values({ userId, title })
      .returning()
    return newSession
  }
}
