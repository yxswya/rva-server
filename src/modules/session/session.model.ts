import { t, UnwrapSchema } from "elysia";

export const SessionModel = {
  chatBody: t.Object({
    text: t.String(),
  }),
};

export type ChatBody = UnwrapSchema<typeof SessionModel.chatBody>;
