export class TrainService {
  static async modelTrain(
    dataset_files: File[],
    dataset_file_metas: Array<{
      task_type: 'rag'
      auto_mask_pii: boolean
    }>,
    rag_cfg: {
      embedding_model: string
      chunk_size: number
    },
    train_cfg: {
      base_model: string
      epochs: number
      device: string
    },
    traceId?: string,
  ) {
    const formData = new FormData()

    // 添加文件
    dataset_files.forEach((file) => {
      formData.append('dataset_files', file)
    })

    // 添加 body JSON
    const body = {
      dataset_file_metas,
      rag_cfg,
      train_cfg,
    }
    formData.append('body', JSON.stringify(body))

    const baseUrl = process.env.LLM_SERVER || 'http://127.0.0.1:8002'
    const response = await fetch(
      `${baseUrl}/api/data/governance/rag/train/from-files`,
      {
        method: 'POST',
        headers: {
          'X-Trace-Id': traceId || '',
        },
        body: formData,
      },
    )

    return response.json()
  }
}
