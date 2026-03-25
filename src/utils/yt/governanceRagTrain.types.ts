/** 数据集文件元信息 */
export interface DatasetFileMetas {
  name: string
  description: string
  task_type: string
  intended_use: string
}

/** RAG 配置（输入） */
export interface RagConfig {
  backend?: string
  embedder?: string
  dim?: number
  metric?: string
  chunk?: {
    size: number
    overlap: number
  }
}

/** 训练配置（输入） */
export interface TrainConfig {
  method?: string
  base_model?: string
  epochs?: number
  batch_size?: number
  lr?: number
  max_seq_len?: number
  lora_r?: number
  lora_alpha?: number
  early_stop?: { patience: number, min_delta: number }
}

/** 数据治理报告 */
export interface GovernanceReports {
  ingest: Record<string, unknown>
  cleaning: Record<string, unknown>
  compliance: Record<string, unknown>
  valuation: Record<string, unknown>
}

/** 数据集摘要 */
export interface DatasetSummary {
  name: string
  task_type: string
  risk_level: string | null
  quality_score: number | null
  pii_count: number
}

/** 数据集存储路径 */
export interface DatasetStorage {
  raw_dir: string
  cleaned_dir: string
  quality_report: string
  manifest: string
  samples_file: string
  standard_samples_file: string
}

/** 治理结果项 */
export interface GovernanceItem {
  dataset_id: string
  cleaned_dataset_path: string
  cleaned_dir: string
  reports: GovernanceReports
  summary: DatasetSummary
  storage: DatasetStorage
}

/** RAG 分块配置 */
export interface RagChunkConfig {
  size: number
  overlap: number
}

/** RAG 配置 */
export interface RagInputConfig {
  backend: string
  embedder: string
  dim: number
  metric: string
  chunk: RagChunkConfig
}

/** RAG 输入 */
export interface RagInputs {
  rag_cfg: RagInputConfig
  dataset_ids: string[]
  clean_id: string | null
}

/** RAG 产物 */
export interface RagArtifacts {
  index_version: string
  index_uri: string
  manifest_uri: string
  embedder: string
  metric: string
  dim: number
}

/** 数据集摘要统计 */
export interface DatasetSummaryStats {
  total: number
  bytes: number
  sources: string[]
  fallback: string[]
  errors: string[]
}

/** 分块分布统计 */
export interface ChunkDistribution {
  min: number
  max: number
  avg: number
  count: number
}

/** RAG 统计 */
export interface RagStats {
  dataset_summary: DatasetSummaryStats
  chunk_distribution: ChunkDistribution
  embedding_dim: number
  embedding_model: string
}

/** RAG 结果 */
export interface RagResult {
  run_id: string
  stage: string
  cached: boolean
  inputs: RagInputs
  artifacts: RagArtifacts
  elapsed_ms: number
  stats: RagStats
  warnings: string[]
}

/** 训练配置输入 */
export interface TrainInputConfig {
  method: string
  base_model: string
  epochs: number
  batch_size: number
  max_seq_len: number
  dataset_uris: string[]
}

/** 训练输入 */
export interface TrainInputs {
  train_cfg: TrainInputConfig
}

/** 训练产物 */
export interface TrainArtifacts {
  ckpt_id: string
  ckpt_uri: string
  mlflow_run: string
}

/** 训练指标 */
export interface TrainMetrics {
  train_loss: number
}

/** 训练结果 */
export interface TrainResult {
  run_id: string
  stage: string
  cached: boolean
  inputs: TrainInputs
  artifacts: TrainArtifacts
  metrics: TrainMetrics
  early_stop: boolean
  elapsed_ms: number
}

/** 回答结果 */
export interface Answer {
  governance: GovernanceItem[]
  rag: RagResult
  train: TrainResult
}

/** 治理 RAG 训练响应 */
export interface GovernanceRagTrainResponse {
  answer: Answer
  confidence: number
  sources: string[]
  error: string | null
}

/** 响应结果 */
export interface Success<T> {
  code: number
  message: string
  data: T
  trace_id?: string
}
