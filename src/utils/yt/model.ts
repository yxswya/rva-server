import type {
  ModelListResponse,
  ModelPredictBody,
  ModelPredictResponse,
  RegisterModelBody,
  RegisterModelResponse,
} from './model.types'
import { request } from '../request'

export * from './model.types'

const LLM_SERVER = process.env.LLM_SERVER
if (!LLM_SERVER) {
  throw new Error('LLM_SERVER environment variable is required')
}
const BASE_URL = `${LLM_SERVER}`

/** 获取已注册的模型列表 */
export async function getModelList(): Promise<ModelListResponse['data']> {
  const response = await fetch(`${BASE_URL}/exec/train/model/list`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const result = await response.json() as ModelListResponse
  return result.data
}

/** 注册模型 */
export async function registerModel(body: RegisterModelBody): Promise<RegisterModelResponse['data']> {
  const result = await request<RegisterModelResponse>('/exec/train/model/use', { ...body })
  return result.data
}

/** 使用已注册的模型对话 */
export async function modelPredict(body: ModelPredictBody): Promise<ModelPredictResponse['data']> {
  const result = await request<ModelPredictResponse>('/exec/train/model/predict', { ...body })
  return result.data
}
