import type { JwtPayload } from '../utils/jwt'
import { bearer } from '@elysiajs/bearer'
import Elysia from 'elysia'
import { JwtUtil } from '../utils/jwt'

export type { JwtPayload }

export const AuthService = new Elysia({ name: 'Auth.Service' })
  .use(bearer())
  .macro({
    auth: {
      resolve({ bearer, status, set }) {
        if (!bearer) {
          set.headers[
            'WWW-Authenticate'
          ] = `Bearer realm='sign', error="invalid_request"`

          return status(401, 'Unauthorized')
        }

        const payload = JwtUtil.verify(bearer)

        if (!payload) {
          set.headers[
            'WWW-Authenticate'
          ] = `Bearer realm='sign', error="invalid_token"`

          return status(401, 'Unauthorized')
        }

        return {
          user: payload,
        }
      },
    },
  })
