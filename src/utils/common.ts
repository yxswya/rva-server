/**
 * 将文件列表转换为数组
 */
export function fileToArray(files: File[] | File): File[] {
  return Array.isArray(files) ? files : [files]
}
