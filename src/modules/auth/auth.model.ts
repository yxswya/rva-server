import { t, UnwrapSchema } from "elysia";

export const AuthModel = {
  signInBody: t.Object({
    username: t.String(),
    password: t.String(),
  }),
};

export type SignInBody = UnwrapSchema<typeof AuthModel.signInBody>;
