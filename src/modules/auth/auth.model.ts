import { t, UnwrapSchema } from "elysia";

export const AuthModel = {
  signInBody: t.Object({
    username: t.String(),
    password: t.String(),
  }),
  signUpBody: t.Object({
    username: t.String(),
    password: t.String(),
    email: t.Optional(t.String({ format: "email" })),
  }),
};

export type SignInBody = UnwrapSchema<typeof AuthModel.signInBody>;
export type SignUpBody = UnwrapSchema<typeof AuthModel.signUpBody>;
