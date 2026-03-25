import type { OnlyOne } from './interface'
import { nanoid } from 'nanoid'
import { db } from '../../db'
import { sessions } from '../../db/schema/sessions'

export class Session implements OnlyOne {
  constructor(
    public userId: string,
    public id: string = nanoid(),
  ) {}

  static async create(userId: string, title: string) {
    const [newSession] = await db
      .insert(sessions)
      .values({ userId, title })
      .returning()
    return newSession
  }
}
