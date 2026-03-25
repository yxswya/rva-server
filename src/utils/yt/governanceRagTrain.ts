import type { DatasetFileMetas, GovernanceRagTrainResponse, RagConfig, Success, TrainConfig } from './governanceRagTrain.types'
import { fileToArray } from '../common'
import { request } from '../request'
// import sj from './out.json'

export * from './governanceRagTrain.types'

// 默认配置
const DEFAULT_RAG_CFG: RagConfig = {
  backend: 'milvus',
  embedder: 'sentence-transformers/all-MiniLM-L6-v2',
  chunk: { size: 800, overlap: 120 },
}

const DEFAULT_TRAIN_CFG = {
  method: 'lora',
  base_model: 'facebook/opt-125m',
  epochs: 1,
  batch_size: 1,
  max_seq_len: 256,
}

export async function governanceRagTrain(
  files: File[],
  rag_cfg?: RagConfig,
  train_cfg?: TrainConfig,
): Promise<GovernanceRagTrainResponse> {
  const trainCfg = {
    method: train_cfg?.method ?? DEFAULT_TRAIN_CFG.method,
    base_model: train_cfg?.base_model ?? DEFAULT_TRAIN_CFG.base_model,
    epochs: train_cfg?.epochs ?? DEFAULT_TRAIN_CFG.epochs,
    batch_size: train_cfg?.batch_size ?? DEFAULT_TRAIN_CFG.batch_size,
    max_seq_len: train_cfg?.max_seq_len ?? DEFAULT_TRAIN_CFG.max_seq_len,
  }

  const ragCfg: RagConfig = {
    backend: rag_cfg?.backend ?? DEFAULT_RAG_CFG.backend,
    embedder: rag_cfg?.embedder ?? DEFAULT_RAG_CFG.embedder,
    dim: rag_cfg?.dim,
    metric: rag_cfg?.metric,
    chunk: rag_cfg?.chunk ?? DEFAULT_RAG_CFG.chunk,
  }

  const fileArray = fileToArray(files as File[] | File)
  const datasetFileMetas: DatasetFileMetas[] = fileArray.map(file => ({
    name: file.name,
    description: `${file.name}-知识库文档`,
    task_type: 'rag',
    intended_use: '知识库检索',
  }))

  const formData = new FormData()
  // 添加文件
  files.forEach((file) => {
    formData.append('dataset_files', file)
  })

  // 添加 body JSON
  formData.append('body', JSON.stringify({
    dataset_file_metas: datasetFileMetas,
    train_cfg: trainCfg,
    rag_cfg: ragCfg,
  }))

  try {
    const result = await request('/data/governance/rag/train/from-files', formData) as Success<GovernanceRagTrainResponse>
    Bun.write(`./governance-train+${Date.now()}.json`, JSON.stringify(result.data, null, 2))
    return result.data
    // return sj
  }
  catch (error) {
    console.error('[ParsePipeline Error]', error)
    throw error
  }
}
