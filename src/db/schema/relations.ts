import { relations } from "drizzle-orm";
import { sessions } from "./sessions";
import { users } from "./users";
import { messages } from "./messages";

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  sessions: one(sessions, {
    fields: [messages.sessionId],
    references: [sessions.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));
