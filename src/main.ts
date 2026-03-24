import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";

const app = new Elysia()
  .use(cors())
  .use(openapi())
  .group("/api/v1", (app) => {
    return app;
  })
  .listen(3010);

console.log(`
  http://${app.server?.hostname}:${app.server?.port}
  http://${app.server?.hostname}:${app.server?.port}/openapi
`);
