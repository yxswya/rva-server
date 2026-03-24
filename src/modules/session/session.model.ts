import { t, UnwrapSchema } from "elysia";

export const SessionModel = {
  signInBody: t.Object({
    username: t.String(),
    password: t.String(),
  }),
};

export type SignInBody = UnwrapSchema<typeof SessionModel.signInBody>;
