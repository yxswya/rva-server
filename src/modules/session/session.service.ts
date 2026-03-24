import { eq } from "drizzle-orm";
import { db } from "../../db";
import { messages } from "../../db/schema/messages";
import { sessions } from "../../db/schema/sessions";

export class SessionService {
  static async createSession(userId: string, title: string) {
    const [newSession] = await db.insert(sessions).values({ userId, title }).returning()
    return newSession
  }

  static async createMessage(userId: string, sessionId: string, content: string) {
    return await db.transaction(async tx => {
      const [newMessage] = await db.insert(messages).values({
        senderId: userId,
        sessionId,
        content
      }).returning()

      await tx.update(sessions).set({
        updated_at: new Date()
      })
        .where(eq(sessions.id, sessionId))

      return newMessage
    })
  }

  static async updateMessage(sessionId: string, messageId: string, content: string) {
    return await db.transaction(async tx => {
      const [updateMessage] = await tx
        .update(messages).set({ content }).where(eq(messages.id, messageId))
        .returning()

      await tx.update(sessions).set({
        updated_at: new Date()
      })
        .where(eq(sessions.id, sessionId))

      return updateMessage
    })
  }

  static async modelTrain(
    dataset_files: File[],
    dataset_file_metas: Array<{
      task_type: "rag";
      auto_mask_pii: boolean;
    }>,
    rag_cfg: {
      embedding_model: string;
      chunk_size: number;
    },
    train_cfg: {
      base_model: string;
      epochs: number;
      device: string;
    },
    traceId?: string
  ) {
    const formData = new FormData();

    // 添加文件
    dataset_files.forEach((file) => {
      formData.append("dataset_files", file);
    });

    // 添加 body JSON
    const body = {
      dataset_file_metas,
      rag_cfg,
      train_cfg,
    };
    formData.append("body", JSON.stringify(body));

    const baseUrl = process.env.LLM_SERVER || "http://127.0.0.1:8002";
    const response = await fetch(
      `${baseUrl}/api/data/governance/rag/train/from-files`,
      {
        method: "POST",
        headers: {
          "X-Trace-Id": traceId || "",
        },
        body: formData,
      }
    );

    return response.json();
  }
}
