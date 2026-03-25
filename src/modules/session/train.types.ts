import { TrainTaskStatus } from '../../db/schema/tasks'

/** 状态对应的消息文本 */
export const TrainStatusMessages: Record<TrainTaskStatus, string> = {
  [TrainTaskStatus.Pending]: '等待中...',
  [TrainTaskStatus.Training]: '训练中...',
  [TrainTaskStatus.OrganizingGovernance]: '整理治理文件中...',
  [TrainTaskStatus.BuildingRag]: '知识库构建中...',
  [TrainTaskStatus.RegisteringModel]: '模型注册中...',
  [TrainTaskStatus.Completed]: '训练结束',
  [TrainTaskStatus.Failed]: '训练失败',
}

/** 训练消息内容结构 */
export interface TrainMessageContent {
  stage: 'model-train'
  status: TrainTaskStatus
  statusMessage: string
  content: string
}

/** 创建训练消息的辅助函数 */
export function createTrainMessage(
  status: TrainTaskStatus,
  customMessage?: string,
): string {
  const message: TrainMessageContent = {
    stage: 'model-train',
    status,
    statusMessage: customMessage ?? TrainStatusMessages[status],
    content: '',
  }
  return JSON.stringify(message)
}
