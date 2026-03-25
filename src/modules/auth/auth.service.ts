import type { SignInBody, SignUpBody } from './auth.model'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { users } from '../../db/schema/users'
import { JwtUtil } from '../../utils/jwt'
import { PasswordUtil } from '../../utils/password'

export class AuthService {
  static async signIn({ username, password }: SignInBody) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))

    if (user && (await PasswordUtil.verify(password, user.password_hash))) {
      const token = JwtUtil.sign({
        userId: user.id,
        username: user.username,
      })
      return {
        access_token: token,
        refresh_token: token,
        user: {
          id: user.id,
          username: user.username,
        },
      }
    }
    return undefined
  }

  static async signUp({ username, password }: SignUpBody) {
    try {
      const [user] = await db
        .insert(users)
        .values({
          username,
          password_hash: await PasswordUtil.hash(password),
        })
        .returning()

      const token = JwtUtil.sign({
        userId: user.id,
        username: user.username,
      })
      return {
        access_token: token,
        refresh_token: token,
        user: {
          id: user.id,
          username: user.username,
        },
      }
    }
    catch (err) {
      console.log('err:', err)
      return undefined
    }
  }

  static async getUserInfo(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId))
    const { password_hash, ...UnWithPassword } = (user || {})

    return UnWithPassword
  }
}
