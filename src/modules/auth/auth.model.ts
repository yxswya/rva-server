import type { UnwrapSchema } from 'elysia'
import { t } from 'elysia'

export const UserSchema = t.Object({
  id: t.String(),
  username: t.String(),
})

export const AuthDataSchema = t.Object({
  access_token: t.String(),
  refresh_token: t.String(),
  user: UserSchema,
})

export function ServiceResultSchema<T extends ReturnType<typeof t.Object>>(dataSchema: T) {
  return t.Object({
    success: t.Boolean(),
    data: t.Optional(dataSchema),
    errorCode: t.Optional(t.Number()),
    errorMessage: t.Optional(t.String()),
  })
}

export const AuthModel = {
  signInBody: t.Object({
    username: t.String(),
    password: t.String(),
  }),
  signUpBody: t.Object({
    username: t.String(),
    password: t.String(),
    email: t.Optional(t.String({ format: 'email' })),
  }),
  signInResponse: ServiceResultSchema(AuthDataSchema),
  signUpResponse: ServiceResultSchema(AuthDataSchema),
}

export type SignInBody = UnwrapSchema<typeof AuthModel.signInBody>
export type SignUpBody = UnwrapSchema<typeof AuthModel.signUpBody>
export type SignInResponse = UnwrapSchema<typeof AuthModel.signInResponse>
export type SignUpResponse = UnwrapSchema<typeof AuthModel.signInResponse>
