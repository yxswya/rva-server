import { SignInBody, SignUpBody } from "./auth.model";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { JwtUtil } from "../../utils/jwt";

export class AuthService {
  static async signIn({ username, password }: SignInBody) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (user && (await Bun.password.verify(password, user.password_hash))) {
      const token = JwtUtil.sign({
        userId: user.id,
        username: user.username,
      });
      return {
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      };
    }
    return undefined;
  }

  static async signUp({ username, password }: SignUpBody) {
    try {
      const [user] = await db
        .insert(users)
        .values({
          username,
          password_hash: await Bun.password.hash(password, "bcrypt"),
        })
        .returning();

      const token = JwtUtil.sign({
        userId: user.id,
        username: user.username,
      });
      return {
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      };
    } catch (err) {
      console.log("err:", err);
      return undefined;
    }
  }
}
