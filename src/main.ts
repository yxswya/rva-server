import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { AuthService } from "./plugins/auth";

import { AuthController, AuthModel } from "./modules/auth";

const app = new Elysia()
  .use(cors())
  .use(openapi())
  .use(AuthService)
  .group("/api/v1", (app) => {
    return app
      .post("/auth/sign-in", ({ body }) => AuthController.signIn(body), {
        body: AuthModel.signInBody,
        response: AuthModel.signInResponse,
        detail: {
          tags: ["Auth"],
          summary: "用户登录",
          description: "使用用户名和密码登录，成功后返回 JWT token",
        },
      })
      .post("/auth/sign-up", ({ body }) => AuthController.signUp(body), {
        body: AuthModel.signUpBody,
        response: AuthModel.signUpResponse,
        detail: {
          tags: ["Auth"],
          summary: "用户注册",
          description: "创建新用户账户，成功后返回 JWT token",
        },
      });
  })
  .listen(3010);

console.log(`
  http://${app.server?.hostname}:${app.server?.port}
  http://${app.server?.hostname}:${app.server?.port}/openapi
`);
