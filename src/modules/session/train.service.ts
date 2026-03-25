import type { CreateTrainBody } from './session.model'
import { governanceRagTrain } from '../../utils/yt/governanceRagTrain'

export class TrainService {
  static async start(sessionId: string | undefined, body: CreateTrainBody) {
    if (!sessionId)
      return

    const data = await governanceRagTrain(body.files, body.rag_cfg, body.train_cfg)

    return {}
    console.log(data)
  }
}
