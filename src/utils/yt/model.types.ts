/** 模型信息 */
export interface ModelInfo {
  id: string
  model_uri: string
  task: string
  model_type: string
  note: string
  exists_local: boolean
  file_size: number
  mtime: string
  created_at: string
}

/** 模型使用提示 */
export interface ModelUsageHint {
  env: Record<string, string>
  cli_example: string
}

/** 注册模型返回的模型信息（包含使用提示） */
export interface RegisteredModelInfo extends ModelInfo {
  usage_hint: ModelUsageHint
}

/** 获取模型列表响应 */
export interface ModelListAnswer {
  models: ModelInfo[]
}

/** 注册模型请求体 */
export interface RegisterModelBody {
  model_uri: string
  task: string
  model_type: string
  note?: string
}

/** 注册模型响应 */
export interface RegisterModelAnswer {
  model: RegisteredModelInfo
}

/** 模型对话请求体 */
export interface ModelPredictBody {
  model_id: string
  prompt: string
  max_new_tokens?: number
  temperature?: number
}

/** 模型对话响应 */
export interface ModelPredictAnswer {
  model_uri: string
  task: string
  prompt: string
  text: string
  max_new_tokens: number
  temperature: number
}

/** 通用响应包装 */
export interface BaseAnswer<T> {
  answer: T
  confidence: number
  sources: string[]
  error: string | null
}

/** 通用成功响应 */
export interface Success<T> {
  code: number
  message: string
  data: T
  trace_id?: string
}

export type ModelListResponse = Success<BaseAnswer<ModelListAnswer>>
export type RegisterModelResponse = Success<BaseAnswer<RegisterModelAnswer>>
export type ModelPredictResponse = Success<BaseAnswer<ModelPredictAnswer>>
