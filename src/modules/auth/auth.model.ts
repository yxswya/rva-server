import { t } from "elysia";

export const AuthModel = {
  signInBody: t.Object({
    username: t.String(),
    password: t.String(),
  }),
};
