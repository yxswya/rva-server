import { SignInBody, SignUpBody } from "./auth.model";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

export class AuthService {
  static async signIn({ username, password }: SignInBody) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (user && (await Bun.password.verify(password, user.password_hash))) {
      const {
        created_at,
        deleted_at,
        updated_at,
        password_hash,
        ...UnWithPassword
      } = user;
      return UnWithPassword;
    } else {
      return undefined;
    }
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

      return user;
    } catch (err) {
      console.log("err:", err);
    }
  }
}
