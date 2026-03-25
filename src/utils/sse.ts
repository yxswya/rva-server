export interface SSEPayload { data: string, event: string }

/**
 * 创建一个异步队列，用于在事件驱动和异步迭代器之间架桥
 */
export function createAsyncQueue<T>() {
  const queue: T[] = []
  let resolve: (() => void) | null = null

  // 使用对象包装，这样内部修改对 while 循环可见
  const state = { done: false }

  const push = (item: T) => {
    if (state.done)
      return
    queue.push(item)
    if (resolve) {
      resolve()
      resolve = null
    }
  }

  const close = () => {
    state.done = true
    if (resolve) {
      resolve()
      resolve = null
    }
  }

  async function* iterate(): AsyncGenerator<T> {
    while (!state.done) {
      if (queue.length === 0) {
        await new Promise<void>((r) => {
          resolve = r
        })
      }

      while (queue.length > 0) {
        const item = queue.shift()
        if (item !== undefined) {
          yield item
        }
      }
    }

    // 排空剩余消息
    while (queue.length > 0) {
      const item = queue.shift()
      if (item !== undefined) {
        yield item
      }
    }
  }

  return {
    push,
    close,
    [Symbol.asyncIterator]: () => iterate(),
  }
}

export function toSSEPayload(event: string, data?: unknown): SSEPayload {
  return {
    data: typeof data === 'object' ? JSON.stringify(data) : String(data ?? ''),
    event,
  }
}
