import type { SSEPayload } from './utils/sse'
import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { Elysia, sse, t } from 'elysia'
import { AuthController, AuthModel } from './modules/auth'

import { SessionController } from './modules/session/session.controller'
import { SessionModel } from './modules/session/session.model'
import { AuthService } from './plugins/auth'
import { eventBus } from './utils/eventBus'
import { createAsyncQueue, toSSEPayload } from './utils/sse'

const app = new Elysia()
  .use(cors())
  .use(openapi())
  .use(AuthService)
  .group('/api/v1', (app) => {
    return app
      // 登录
      .post('/auth/sign-in', ({ body }) => AuthController.signIn(body), {
        body: AuthModel.signInBody,
        response: AuthModel.signInResponse,
        detail: {
          tags: ['Auth'],
          summary: '用户登录',
          description: '使用用户名和密码登录，成功后返回 JWT token',
        },
      })
      // 注册
      .post('/auth/sign-up', ({ body }) => AuthController.signUp(body), {
        body: AuthModel.signUpBody,
        response: AuthModel.signUpResponse,
        detail: {
          tags: ['Auth'],
          summary: '用户注册',
          description: '创建新用户账户，成功后返回 JWT token',
        },
      })
      // 获取用户信息
      .get('/auth/me', ({ user }) => AuthController.userInfo(user.userId), {
        auth: true,
      })
      // 聊天
      .post(
        '/session/chat/:sessionId?',
        ({ body, user, params: { sessionId } }) => SessionController.chat(user.userId, sessionId, body),
        {
          body: SessionModel.chatBody,
          params: SessionModel.chatParams,
          auth: true,
        },
      )
      .get('/session/chat/:sessionId?', ({ params: { sessionId } }) => SessionController.getData(sessionId), {
        params: SessionModel.chatParams,
        auth: true,
      })
      // 会话 流式输出
      .get('/session/chat/sse/:sessionId', async function* ({ request, params: { sessionId } }) {
        // 1. 通知客户端连接就绪
        yield sse({ data: '', event: 'ready' })

        // 2. 创建异步队列
        const queue = createAsyncQueue<SSEPayload>()

        // 3. 心跳保活
        const heartbeatInterval = setInterval(() => {
          queue.push(toSSEPayload('heartbeat', 'ping'))
        }, 3000)

        // 4. 监听业务事件
        const channel = `chat-${sessionId}`
        const onMessage = (data: unknown) => {
          queue.push(toSSEPayload('message', data))
        }
        eventBus.on(channel, onMessage)

        // 5. 客户端断开时统一清理（只执行一次）
        const cleanup = () => {
          clearInterval(heartbeatInterval)
          eventBus.off(channel, onMessage)
          queue.close()
        }
        request.signal.addEventListener('abort', cleanup, { once: true })

        // 6. 持续消费队列并推送
        try {
          for await (const msg of queue) {
            yield sse(msg)
          }
        }
        finally {
          cleanup() // 兜底，确保无论如何都释放资源
        }
      }, {
        params: SessionModel.chatParams,
        auth: true,
      })
      .post('/train/:sessionId', () => { }, {
        body: t.Object({

        }),
        params: t.Object({
          session: t.String(),
        }),
      })
  })
  .listen(3010)

console.log(`
  http://${app.server?.hostname}:${app.server?.port}
  http://${app.server?.hostname}:${app.server?.port}/openapi
`)

export type App = typeof app
