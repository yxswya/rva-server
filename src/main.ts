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
      })
      .post("/auth/sign-up", ({ body }) => AuthController.signIn(body), {
        body: AuthModel.signInBody,
      });
  })
  .listen(3010);

console.log(`
  http://${app.server?.hostname}:${app.server?.port}
  http://${app.server?.hostname}:${app.server?.port}/openapi
`);
