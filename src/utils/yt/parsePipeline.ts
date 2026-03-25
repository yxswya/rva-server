import type { MessageContent, Success } from './parsePipeline.types'
import { request } from '../request'

export * from './parsePipeline.types'

// 意图识别接口
export async function parsePipeline(sessionId: string, text: string): Promise<unknown> {
  try {
    const result = await request('/parse/pipeline', {
      session_id: sessionId,
      text,
      content: text,
      run_quality_check: false,
    }) as Success<MessageContent>

    return result.data
  }
  catch (error) {
    console.error('[ParsePipeline Error]', error)
  }
}
